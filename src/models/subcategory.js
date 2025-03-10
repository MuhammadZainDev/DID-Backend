const pool = require('../config/db');

class Subcategory {
  // Get all subcategories
  static async getAllSubcategories() {
    try {
      const query = 'SELECT id, category_id, name, reference, description, icon FROM subcategories ORDER BY name';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get subcategories by category ID
  static async getSubcategoriesByCategoryId(categoryId) {
    try {
      const query = 'SELECT id, category_id, name, reference, description, icon FROM subcategories WHERE category_id = $1 ORDER BY name';
      const { rows } = await pool.query(query, [categoryId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get a single subcategory by ID
  static async getSubcategoryById(id) {
    try {
      const query = 'SELECT id, category_id, name, reference, description, icon FROM subcategories WHERE id = $1';
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Subcategory; 