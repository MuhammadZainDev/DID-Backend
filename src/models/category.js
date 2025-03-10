const pool = require('../config/db');

class Category {
  // Get all categories
  static async getAllCategories() {
    try {
      const query = 'SELECT * FROM categories ORDER BY name';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get a single category by ID
  static async getCategoryById(id) {
    try {
      const query = 'SELECT * FROM categories WHERE id = $1';
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category; 