const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log the error for debugging (sensitive details removed in production)
  if (isProduction) {
    // In production, don't log sensitive details or stack traces
    logger.error({
      message: 'Error in request',
      path: req.path,
      method: req.method,
      errorType: err.name,
      errorMessage: err.message
    });
  } else {
    // In development, log more details for debugging
    logger.error('Error:', err);
  }

  // Handle specific known errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: isProduction ? 'Validation error' : err.message
    });
  }
  
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication error'
    });
  }
  
  if (err.response && err.response.data) {
    // Handle errors from external APIs (e.g., Aladhan API)
    return res.status(err.response.status || 500).json({
      error: isProduction 
        ? 'External service error' 
        : (err.response.data.data || 'An error occurred with the external service')
    });
  }

  // Handle database errors
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL constraint violation errors
    return res.status(400).json({
      error: isProduction 
        ? 'Database constraint violation' 
        : `Database error: ${err.message}`
    });
  }

  // Handle all other errors
  const statusCode = err.statusCode || 500;
  const errorMessage = isProduction
    ? 'An unexpected error occurred'
    : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: errorMessage
  });
}

module.exports = { errorHandler }; 