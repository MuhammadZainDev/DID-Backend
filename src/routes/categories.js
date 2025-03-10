const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const { logger } = require('../utils/logger');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json(categories);
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get a single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error(`Error fetching category: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 