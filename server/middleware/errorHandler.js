const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || null;

  if (err.status === 401 && err.message?.includes('Incorrect API key')) {
    statusCode = 500;
    message = 'AI service authentication failed. Please check API configuration.';
    errorCode = 'AI_AUTH_FAILED';
  }

  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable. Please try again later.';
    errorCode = 'SERVICE_UNAVAILABLE';
  }

  const response = {
    success: false,
    message: message,
    ...(errorCode && { errorCode })
  };

  if (isDevelopment) {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
