const pool = require('../config/db');

class Dua {
  // Get all duas
  static async getAllDuas() {
    try {
      const query = 'SELECT * FROM duas ORDER BY name';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get duas by subcategory ID
  static async getDuasBySubcategoryId(subcategoryId) {
    try {
      const query = 'SELECT * FROM duas WHERE subcategory_id = $1 ORDER BY name';
      const { rows } = await pool.query(query, [subcategoryId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get a single dua by ID
  static async getDuaById(id) {
    try {
      const query = 'SELECT * FROM duas WHERE id = $1';
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Dua; 