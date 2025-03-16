require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favorites');
const categoryRoutes = require('./routes/categories');
const subcategoryRoutes = require('./routes/subcategories');
const duaRoutes = require('./routes/duas');
const contactRoutes = require('./routes/contact');
const geminiDuaRoutes = require('./routes/geminiDua');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Security configurations
// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Enable CORS with proper config
app.use(express.json()); // Parse JSON bodies

// Logging - use combined format in production and dev format in development
app.use(morgan(isProduction ? 'combined' : 'dev', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// Rate limiting - stricter in production
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 20 : 100, // limit auth requests
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 500, // limit each IP to 100 requests per 15 minutes in production
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to specific routes
app.use('/api/auth', authLimiter); // Stricter limits for auth routes
app.use('/api/contact', authLimiter); // Stricter limits for contact form
app.use('/api/gemini', authLimiter); // Stricter limits for AI requests
app.use('/api', apiLimiter); // General rate limiting for all API routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/duas', duaRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gemini', geminiDuaRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
}); 