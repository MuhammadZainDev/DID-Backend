const pool = require('../config/db');

class Favorite {
  // Add a dua to favorites
  static async addToFavorites(userId, duaId, subcategoryId) {
    try {
      // Check if already in favorites
      const checkQuery = 'SELECT id FROM favorites WHERE user_id = $1 AND dua_id = $2';
      const checkResult = await pool.query(checkQuery, [userId, duaId]);
      
      if (checkResult.rows.length > 0) {
        return { message: 'Item is already in favorites' };
      }
      
      const query = `
        INSERT INTO favorites (user_id, dua_id, subcategory_id)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, dua_id, subcategory_id, created_at
      `;
      const values = [userId, duaId, subcategoryId];
      const { rows } = await pool.query(query, values);
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Remove a dua from favorites
  static async removeFromFavorites(userId, duaId) {
    try {
      const query = `
        DELETE FROM favorites
        WHERE user_id = $1 AND dua_id = $2
        RETURNING id
      `;
      const values = [userId, duaId];
      const { rows } = await pool.query(query, values);
      
      if (rows.length === 0) {
        return { message: 'Item not found in favorites' };
      }
      
      return { message: 'Item removed from favorites' };
    } catch (error) {
      throw error;
    }
  }
  
  // Get all favorites for a user
  static async getUserFavorites(userId) {
    try {
      const query = `
        SELECT f.id, f.user_id, f.dua_id, f.subcategory_id, f.created_at
        FROM favorites f
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC
      `;
      const values = [userId];
      const { rows } = await pool.query(query, values);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Check if a dua is in user's favorites
  static async isInFavorites(userId, duaId) {
    try {
      const query = `
        SELECT id FROM favorites
        WHERE user_id = $1 AND dua_id = $2
      `;
      const values = [userId, duaId];
      const { rows } = await pool.query(query, values);
      
      return { isFavorite: rows.length > 0 };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Favorite; 