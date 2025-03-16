const { Pool } = require('pg');
require('dotenv').config();
const { logger } = require('../utils/logger');

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Configure connection options
const poolConfig = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Agar aap Render, Railway, ya Neon use kar rahe hain
      },
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'DuaonAI',
      password: process.env.DB_PASSWORD || 'your_password',
      port: process.env.DB_PORT || 5432,
    };

// Create the pool
const pool = new Pool(poolConfig);

// Pool error handling
pool.on('error', (err, client) => {
  logger.error(`Unexpected error on idle client: ${err.message}`);
});

// Export the query function directly for cleaner usage
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};