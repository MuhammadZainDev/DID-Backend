const express = require('express');
const router = express.Router();
const Subcategory = require('../models/subcategory');
const { logger } = require('../utils/logger');

// @route   GET /api/subcategories
// @desc    Get all subcategories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const subcategories = await Subcategory.getAllSubcategories();
    res.json(subcategories);
  } catch (error) {
    logger.error(`Error fetching subcategories: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/subcategories/category/:categoryId
// @desc    Get subcategories by category ID
// @access  Public
router.get('/category/:categoryId', async (req, res) => {
  try {
    const subcategories = await Subcategory.getSubcategoriesByCategoryId(req.params.categoryId);
    res.json(subcategories);
  } catch (error) {
    logger.error(`Error fetching subcategories by category: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/subcategories/:id
// @desc    Get a single subcategory
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const subcategory = await Subcategory.getSubcategoryById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json(subcategory);
  } catch (error) {
    logger.error(`Error fetching subcategory: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 