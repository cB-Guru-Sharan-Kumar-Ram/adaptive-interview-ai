import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSession: null,
  currentQuestion: null,
  loading: false,
  error: null,
  history: [],
  report: null
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterviewRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    startInterviewSuccess: (state, action) => {
      state.loading = false;
      state.currentSession = action.payload;
      state.currentQuestion = {
        questionId: action.payload.questionId,
        question: action.payload.question,
        questionNumber: action.payload.questionNumber,
        difficulty: action.payload.difficulty
      };
    },
    startInterviewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    submitAnswerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    submitAnswerSuccess: (state, action) => {
      state.loading = false;
      if (action.payload.completed) {
        state.report = action.payload.report;
        state.currentQuestion = null;
      } else {
        state.currentQuestion = {
          questionId: action.payload.nextQuestion.questionId,
          question: action.payload.nextQuestion.question,
          questionNumber: action.payload.nextQuestion.questionNumber,
          difficulty: action.payload.nextQuestion.difficulty
        };
      }
    },
    submitAnswerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadHistorySuccess: (state, action) => {
      state.history = action.payload;
    },
    loadReportSuccess: (state, action) => {
      state.report = action.payload;
    },
    clearInterview: (state) => {
      state.currentSession = null;
      state.currentQuestion = null;
      state.report = null;
      state.error = null;
    }
  }
});

export const {
  startInterviewRequest,
  startInterviewSuccess,
  startInterviewFailure,
  submitAnswerRequest,
  submitAnswerSuccess,
  submitAnswerFailure,
  loadHistorySuccess,
  loadReportSuccess,
  clearInterview
} = interviewSlice.actions;

export default interviewSlice.reducer;
