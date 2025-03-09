const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Error:', err);

  if (err.response && err.response.data) {
    // Handle Aladhan API errors
    return res.status(err.response.status || 500).json({
      error: err.response.data.data || 'An error occurred with the prayer times service'
    });
  }

  // Handle other errors
  res.status(500).json({
    error: err.message || 'An unexpected error occurred'
  });
}

module.exports = { errorHandler }; 