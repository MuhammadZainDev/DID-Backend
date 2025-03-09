const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async createUser({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    try {
      const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email
      `;
      const { rows } = await pool.query(query, [name, email, hashedPassword]);
      return rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation error code
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async storeResetToken(email, resetToken, expiresAt) {
    try {
      // First check if the user exists
      const user = await this.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Store the reset token and expiration in the database
      const query = `
        UPDATE users 
        SET reset_token = $1, reset_token_expires = $2 
        WHERE email = $3
        RETURNING id
      `;
      const { rows } = await pool.query(query, [resetToken, expiresAt, email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByResetToken(resetToken) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE reset_token = $1 AND reset_token_expires > NOW()
      `;
      const { rows } = await pool.query(query, [resetToken]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(userId, newPassword) {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the password and clear the reset token
      const query = `
        UPDATE users 
        SET password = $1, reset_token = NULL, reset_token_expires = NULL 
        WHERE id = $2
        RETURNING id
      `;
      const { rows } = await pool.query(query, [hashedPassword, userId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 