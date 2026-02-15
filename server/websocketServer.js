const { Server } = require('socket.io');
const VoiceService = require('./services/voiceService');
const AvatarController = require('./controllers/avatarController');
const InterviewEngine = require('./services/interviewEngine');

class WebSocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: { 
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'] 
      },
      transports: ['websocket', 'polling']
    });
    this.sessions = new Map();
    this.initialize();
  }

  initialize() {
    this.io.on('connection', (socket) => {

      socket.on('start-interview', async (data) => {
        await this.handleStartInterview(socket, data);
      });

      socket.on('voice-data', async (audioChunk) => {
        await this.handleVoiceData(socket, audioChunk);
      });

      socket.on('stop-speaking', async () => {
        await this.handleStopSpeaking(socket);
      });

      socket.on('end-interview', async () => {
        await this.handleEndInterview(socket);
      });

      socket.on('disconnect', () => {
        this.cleanupSession(socket.id);
      });
    });
  }

  async handleStartInterview(socket, { userId, role, difficulty, interviewType, maxQuestions }) {
    try {
      const session = await InterviewEngine.createSession(userId, role, difficulty, interviewType, maxQuestions);
      
      this.sessions.set(socket.id, {
        sessionId: session.sessionId,
        userId,
        voiceStream: null,
        currentQuestion: session.question,
        questionNumber: 1,
        maxQuestions: session.maxQuestions
      });

      const greeting = `Hello! I'm your AI interviewer for this ${difficulty} level ${role} interview. Let's begin with the first question.`;
      const audioUrl = await VoiceService.textToSpeech(greeting);
      const visemes = AvatarController.generateVisemes(greeting);

      socket.emit('avatar-speak', {
        audio: audioUrl,
        text: greeting,
        visemes,
        emotion: 'friendly'
      });

      setTimeout(async () => {
        const questionAudio = await VoiceService.textToSpeech(session.question);
        const questionVisemes = AvatarController.generateVisemes(session.question);

        socket.emit('avatar-speak', {
          audio: questionAudio,
          text: session.question,
          visemes: questionVisemes,
          emotion: 'professional',
          metadata: {
            questionNumber: 1,
            maxQuestions: session.maxQuestions
          }
        });

        socket.emit('avatar-listening');
      }, 5000);
    } catch (error) {
      console.error('Start interview error:', error);
      socket.emit('error', { message: 'Failed to start interview' });
    }
  }

  async handleVoiceData(socket, audioChunk) {
    const session = this.sessions.get(socket.id);
    if (!session) return;

    if (!session.voiceStream) {
      session.voiceStream = VoiceService.createSTTStream((transcript) => {
        socket.emit('transcript-update', { text: transcript, isFinal: false });
      });
    }

    session.voiceStream.send(audioChunk);
  }

  async handleStopSpeaking(socket) {
    const session = this.sessions.get(socket.id);
    if (!session || !session.voiceStream) return;

    try {
      const finalTranscript = await session.voiceStream.finalize();
      socket.emit('transcript-update', { text: finalTranscript, isFinal: true });

      socket.emit('avatar-thinking');

      const result = await InterviewEngine.submitAnswer(
        session.sessionId,
        session.currentQuestion.questionId,
        finalTranscript
      );

      const feedback = this.generateConversationalFeedback(result);
      const feedbackAudio = await VoiceService.textToSpeech(feedback);
      const feedbackVisemes = AvatarController.generateVisemes(feedback);

      socket.emit('avatar-speak', {
        audio: feedbackAudio,
        text: feedback,
        visemes: feedbackVisemes,
        emotion: result.score >= 70 ? 'positive' : 'encouraging'
      });

      if (result.completed) {
        setTimeout(() => this.sendClosingStatement(socket, result.report), 3000);
      } else {
        setTimeout(async () => {
          const nextQuestionAudio = await VoiceService.textToSpeech(result.nextQuestion.question);
          const nextQuestionVisemes = AvatarController.generateVisemes(result.nextQuestion.question);

          session.currentQuestion = result.nextQuestion;
          session.questionNumber = result.nextQuestion.questionNumber;

          socket.emit('avatar-speak', {
            audio: nextQuestionAudio,
            text: result.nextQuestion.question,
            visemes: nextQuestionVisemes,
            emotion: 'professional',
            metadata: {
              questionNumber: result.nextQuestion.questionNumber,
              maxQuestions: session.maxQuestions
            }
          });

          socket.emit('avatar-listening');
        }, 3000);
      }

      session.voiceStream = null;
    } catch (error) {
      console.error('Stop speaking error:', error);
      socket.emit('error', { message: 'Failed to process answer' });
    }
  }

  async sendClosingStatement(socket, report) {
    const closing = `Great work! You've completed the interview. Your overall score is ${report.overall_score} out of 100. Let me show you the detailed results.`;
    const closingAudio = await VoiceService.textToSpeech(closing);
    const closingVisemes = AvatarController.generateVisemes(closing);

    socket.emit('avatar-speak', {
      audio: closingAudio,
      text: closing,
      visemes: closingVisemes,
      emotion: 'friendly'
    });

    setTimeout(() => {
      socket.emit('interview-complete', { report });
    }, 5000);
  }

  generateConversationalFeedback(result) {
    const score = result.score;
    const feedback = result.feedback;

    if (score >= 80) {
      return `Excellent answer! ${feedback}`;
    } else if (score >= 60) {
      return `Good attempt. ${feedback} Let's continue.`;
    } else {
      return `I appreciate your effort. ${feedback} Take your time with the next one.`;
    }
  }

  async handleEndInterview(socket) {
    const session = this.sessions.get(socket.id);
    if (session) {
      await InterviewEngine.endSession(session.sessionId);
      this.cleanupSession(socket.id);
    }
  }

  cleanupSession(socketId) {
    const session = this.sessions.get(socketId);
    if (session?.voiceStream) {
      session.voiceStream.close();
    }
    this.sessions.delete(socketId);
  }
}

module.exports = WebSocketServer;
