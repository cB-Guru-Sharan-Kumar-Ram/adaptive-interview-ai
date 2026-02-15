const InterviewService = require('./interviewService');

class InterviewEngine {
  static async createSession(userId, role, difficulty, interviewType, maxQuestions) {
    return await InterviewService.startInterview(userId, role, difficulty, interviewType, maxQuestions);
  }

  static async submitAnswer(sessionId, questionId, transcript) {
    return await InterviewService.submitAnswer(sessionId, questionId, transcript);
  }

  static async endSession(sessionId) {
    // Reserved for future cleanup logic
  }
}

module.exports = InterviewEngine;
