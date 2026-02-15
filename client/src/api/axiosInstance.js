import axios from 'axios';
import { store } from '../store/store';
import { showError } from '../store/slices/errorSlice';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      const errorMessage = response.data.message || 'Something went wrong. Please try again.';
      store.dispatch(showError(errorMessage));
      return Promise.reject(new Error(errorMessage));
    }
    return response;
  },
  (error) => {
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    store.dispatch(showError(errorMessage));
    
    const customError = new Error(errorMessage);
    customError.errorCode = error.response?.data?.errorCode;
    customError.statusCode = error.response?.status;
    
    return Promise.reject(customError);
  }
);

export default axiosInstance;
