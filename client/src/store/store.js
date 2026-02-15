import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import interviewReducer from './slices/interviewSlice';
import errorReducer from './slices/errorSlice';
import voiceInterviewReducer from './slices/voiceInterviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer,
    error: errorReducer,
    voiceInterview: voiceInterviewReducer
  }
});
