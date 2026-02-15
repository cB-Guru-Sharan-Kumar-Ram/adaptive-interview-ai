import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  avatar: {
    state: 'idle',
    visemes: [],
    emotion: 'professional',
    audio: null,
    text: ''
  },
  transcript: [],
  questionNumber: 0,
  maxQuestions: 0,
  role: '',
  difficulty: '',
  interviewType: '',
  isComplete: false,
  report: null
};

const voiceInterviewSlice = createSlice({
  name: 'voiceInterview',
  initialState,
  reducers: {
    setInterviewConfig: (state, action) => {
      state.role = action.payload.role;
      state.difficulty = action.payload.difficulty;
      state.interviewType = action.payload.interviewType;
      state.maxQuestions = action.payload.maxQuestions;
    },
    avatarSpeak: (state, action) => {
      state.avatar.state = 'speaking';
      state.avatar.audio = action.payload.audio;
      state.avatar.text = action.payload.text;
      state.avatar.visemes = action.payload.visemes;
      state.avatar.emotion = action.payload.emotion || 'professional';
      
      if (action.payload.metadata) {
        state.questionNumber = action.payload.metadata.questionNumber;
        state.maxQuestions = action.payload.metadata.maxQuestions;
      }

      state.transcript.push({
        speaker: 'ai',
        text: action.payload.text,
        timestamp: Date.now()
      });
    },
    avatarListen: (state) => {
      state.avatar.state = 'listening';
      state.avatar.emotion = 'professional';
    },
    avatarThink: (state) => {
      state.avatar.state = 'thinking';
      state.avatar.emotion = 'thinking';
    },
    updateTranscript: (state, action) => {
      if (action.payload.isFinal) {
        state.transcript.push({
          speaker: 'user',
          text: action.payload.text,
          timestamp: Date.now()
        });
      }
    },
    interviewComplete: (state, action) => {
      state.isComplete = true;
      state.report = action.payload.report;
    },
    resetInterview: (state) => {
      return initialState;
    }
  }
});

export const {
  setInterviewConfig,
  avatarSpeak,
  avatarListen,
  avatarThink,
  updateTranscript,
  interviewComplete,
  resetInterview
} = voiceInterviewSlice.actions;

export default voiceInterviewSlice.reducer;
