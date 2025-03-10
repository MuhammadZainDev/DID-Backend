const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      logger.error(`Invalid token: ${err.message}`);
      res.status(401).json({ error: 'Token is not valid' });
    }
  } catch (err) {
    logger.error(`Auth middleware error: ${err.message}`);
    res.status(500).json({ error: 'Server Error' });
  }
}; 