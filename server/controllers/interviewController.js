const InterviewService = require('../services/interviewService');

const DIFFICULTY_MAP = {
  beginner: 'easy',
  easy: 'easy',
  medium: 'medium',
  intermediate: 'medium',
  advanced: 'hard',
  hard: 'hard',
  expert: 'hard'
};

class InterviewController {
  static async startInterview(req, res, next) {
    try {
      const { role, difficulty, interviewType = 'technical', maxQuestions = 5 } = req.body;
      const userId = req.user.userId;

      if (!role || !difficulty) {
        return res.status(400).json({ 
          success: false,
          error: 'Role and difficulty are required' 
        });
      }

      const mappedDifficulty = DIFFICULTY_MAP[difficulty.toLowerCase()];
      if (!mappedDifficulty) {
        return res.status(400).json({ 
          success: false,
          error: `Invalid difficulty level: "${difficulty}". Accepted values: beginner, easy, medium, intermediate, advanced, hard, expert` 
        });
      }

      const validTypes = ['technical', 'behavioral', 'mixed'];
      if (!validTypes.includes(interviewType)) {
        return res.status(400).json({ 
          success: false,
          error: `Invalid interview type: "${interviewType}". Accepted values: ${validTypes.join(', ')}` 
        });
      }

      const result = await InterviewService.startInterview(userId, role, mappedDifficulty, interviewType, maxQuestions);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async submitAnswer(req, res, next) {
    try {
      const { sessionId, questionId, answer } = req.body;

      if (!sessionId || !questionId || !answer) {
        return res.status(400).json({ error: 'Session ID, question ID, and answer are required' });
      }

      const result = await InterviewService.submitAnswer(sessionId, questionId, answer);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReport(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.userId;

      const report = await InterviewService.getReport(parseInt(sessionId), userId);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const sessions = await InterviewService.getHistory(userId);
      res.json({ sessions });
    } catch (error) {
      next(error);
    }
  }

  static async getSessionQA(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.userId;
      
      const qa = await InterviewService.getSessionQA(parseInt(sessionId), userId);
      res.json({ qa });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InterviewController;
