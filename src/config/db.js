const { Pool } = require('pg');
require('dotenv').config();

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Configure connection options
const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'DuaonAIDB',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
  
  // SSL configuration for production
  ssl: isProduction ? {
    rejectUnauthorized: true, // Verify SSL certificate
    // If you have a self-signed certificate, set this to false
    // rejectUnauthorized: false,
  } : false
};

// Create the pool
const pool = new Pool(poolConfig);

// Pool error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Do not throw error as this would crash the server
});

// Export the query function directly for cleaner usage
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 