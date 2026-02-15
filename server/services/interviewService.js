const { pool } = require('../config/db');
const OpenAIService = require('./openaiService');

class InterviewService {
  static async startInterview(userId, role, difficulty, interviewType = 'technical', maxQuestions = 5) {
    const [sessionResult] = await pool.query(
      `INSERT INTO interview_sessions 
       (user_id, role, interview_type, initial_difficulty, current_difficulty, max_questions) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, role, interviewType, difficulty, difficulty, maxQuestions]
    );

    const sessionId = sessionResult.insertId;
    const questionText = await OpenAIService.generateFirstQuestion(role, difficulty);
    
    const [questionResult] = await pool.query(
      `INSERT INTO questions (session_id, question_text, difficulty, question_number) 
       VALUES (?, ?, ?, ?)`,
      [sessionId, questionText, difficulty, 1]
    );

    const questionId = questionResult.insertId;

    await pool.query(
      `UPDATE interview_sessions SET question_count = ? WHERE id = ?`,
      [1, sessionId]
    );

    return {
      sessionId,
      questionId,
      question: questionText,
      questionNumber: 1,
      maxQuestions,
      difficulty,
      interviewType
    };
  }

  static async submitAnswer(sessionId, questionId, answerText) {
    const [[sessions], [questions]] = await Promise.all([
      pool.query('SELECT * FROM interview_sessions WHERE id = ? AND status = ?', [sessionId, 'active']),
      pool.query('SELECT * FROM questions WHERE id = ? AND status = ?', [questionId, 'active'])
    ]);

    const session = sessions[0];
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    if (session.ended_at) {
      const error = new Error('Interview session has ended');
      error.statusCode = 400;
      throw error;
    }

    const question = questions[0];
    if (!question || question.session_id !== sessionId) {
      const error = new Error('Question not found');
      error.statusCode = 404;
      throw error;
    }

    const [[previousQA], [followupCheck]] = await Promise.all([
      pool.query(
        `SELECT q.question_text, a.answer_text, a.score, q.difficulty
         FROM questions q JOIN answers a ON q.id = a.question_id
         WHERE q.session_id = ? AND q.status = ?
         ORDER BY q.question_number ASC`,
        [sessionId, 'active']
      ),
      pool.query(
        `SELECT COUNT(*) as count FROM answers 
         WHERE session_id = ? AND is_followup_triggered = TRUE AND status = ?`,
        [sessionId, 'active']
      )
    ]);

    const avgScore = previousQA.length > 0 
      ? previousQA.reduce((sum, a) => sum + parseFloat(a.score), 0) / previousQA.length 
      : 50;
    const newDifficulty = this.adjustDifficulty(session.current_difficulty, avgScore);
    const isLastQuestion = session.question_count >= session.max_questions;

    const result = await OpenAIService.evaluateAndGenerateNext(
      question.question_text,
      answerText,
      question.difficulty,
      session.role,
      session.interview_type,
      previousQA,
      avgScore,
      isLastQuestion
    );

    const hasFollowup = followupCheck[0].count > 0;
    const shouldTriggerFollowup = !hasFollowup && result.score < 70;

    await Promise.all([
      pool.query(
        `INSERT INTO answers (question_id, session_id, answer_text, score, feedback, is_followup_triggered) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [questionId, sessionId, answerText, result.score, result.feedback, shouldTriggerFollowup]
      ),
      pool.query(
        `UPDATE interview_sessions SET current_difficulty = ?, overall_score = ? WHERE id = ?`,
        [newDifficulty, ((avgScore * previousQA.length + result.score) / (previousQA.length + 1)).toFixed(2), sessionId]
      )
    ]);

    if (isLastQuestion) {
      const report = await this.generateFinalReport(sessionId);
      
      await pool.query(
        `UPDATE interview_sessions SET ended_at = NOW(), report = ? WHERE id = ?`,
        [JSON.stringify(report), sessionId]
      );

      return {
        completed: true,
        score: result.score,
        feedback: result.feedback,
        report
      };
    }

    const nextQuestion = result.nextQuestion;
    const nextQuestionNumber = session.question_count + 1;
    
    const [nextQuestionResult] = await pool.query(
      `INSERT INTO questions (session_id, question_text, difficulty, question_number) 
       VALUES (?, ?, ?, ?)`,
      [sessionId, nextQuestion, newDifficulty, nextQuestionNumber]
    );

    await pool.query(
      `UPDATE interview_sessions SET question_count = ? WHERE id = ?`,
      [nextQuestionNumber, sessionId]
    );

    return {
      completed: false,
      score: result.score,
      feedback: result.feedback,
      nextQuestion: {
        questionId: nextQuestionResult.insertId,
        question: nextQuestion,
        questionNumber: nextQuestionNumber,
        maxQuestions: session.max_questions,
        difficulty: newDifficulty
      }
    };
  }

  static adjustDifficulty(currentDifficulty, avgScore) {
    if (avgScore >= 80) {
      if (currentDifficulty === 'easy') return 'medium';
      if (currentDifficulty === 'medium') return 'hard';
    }
    if (avgScore <= 50) {
      if (currentDifficulty === 'hard') return 'medium';
      if (currentDifficulty === 'medium') return 'easy';
    }
    return currentDifficulty;
  }

  static async generateFinalReport(sessionId) {
    const [sessions] = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = ? AND status = ?',
      [sessionId, 'active']
    );

    const session = sessions[0];

    const [answers] = await pool.query(
      `SELECT a.*, q.question_text, q.difficulty 
       FROM answers a 
       JOIN questions q ON a.question_id = q.id 
       WHERE a.session_id = ? AND a.status = ? 
       ORDER BY a.created_at ASC`,
      [sessionId, 'active']
    );

    const report = await OpenAIService.generateReport(session, answers);
    
    const sessionDuration = session.ended_at && session.started_at 
      ? Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 60000) 
      : 0;

    await pool.query(
      'UPDATE interview_sessions SET total_duration_minutes = ? WHERE id = ?',
      [sessionDuration, sessionId]
    );

    return {
      ...report,
      overall_score_out_of_10: (report.overall_score / 10).toFixed(1),
      session_duration_minutes: sessionDuration
    };
  }

  static async getReport(sessionId, userId) {
    const [sessions] = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = ? AND status = ?',
      [sessionId, 'active']
    );

    const session = sessions[0];
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    if (session.user_id !== userId) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    if (!session.ended_at) {
      const error = new Error('Interview not completed yet');
      error.statusCode = 400;
      throw error;
    }

    return {
      sessionId: session.id,
      role: session.role,
      difficulty: session.initial_difficulty,
      questionCount: session.question_count,
      overallScore: parseFloat(session.overall_score),
      startedAt: session.started_at,
      endedAt: session.ended_at,
      report: session.report
    };
  }

  static async getHistory(userId) {
    const [sessions] = await pool.query(
      `SELECT id, role, initial_difficulty, interview_type, question_count, overall_score, 
              started_at, ended_at, created_at, status 
       FROM interview_sessions 
       WHERE user_id = ? AND status = ? AND question_count > 0 AND ended_at IS NOT NULL
       ORDER BY created_at DESC`,
      [userId, 'active']
    );

    return sessions.map(s => ({
      id: s.id,
      sessionId: s.id,
      role: s.role,
      difficulty: s.initial_difficulty,
      interviewType: s.interview_type,
      questionCount: s.question_count,
      overallScore: s.overall_score ? parseFloat(s.overall_score) : 0,
      createdAt: s.created_at,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      status: 'completed'
    }));
  }

  static async getSessionQA(sessionId, userId) {
    const [sessions] = await pool.query(
      'SELECT user_id FROM interview_sessions WHERE id = ? AND status = ?',
      [sessionId, 'active']
    );

    if (sessions.length === 0) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    if (sessions[0].user_id !== userId) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    const [qa] = await pool.query(
      `SELECT q.id as question_id, q.question_text, q.difficulty, q.question_number,
              a.answer_text, a.score, a.feedback
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id
       WHERE q.session_id = ? AND q.status = ?
       ORDER BY q.question_number ASC`,
      [sessionId, 'active']
    );

    return qa;
  }
}

module.exports = InterviewService;
