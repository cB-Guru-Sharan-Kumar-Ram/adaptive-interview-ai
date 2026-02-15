import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: 'error',
  visible: false
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    showError: (state, action) => {
      state.message = action.payload;
      state.type = 'error';
      state.visible = true;
    },
    showSuccess: (state, action) => {
      state.message = action.payload;
      state.type = 'success';
      state.visible = true;
    },
    hideError: (state) => {
      state.visible = false;
      state.message = null;
    }
  }
});

export const { showError, showSuccess, hideError } = errorSlice.actions;
export default errorSlice.reducer;
