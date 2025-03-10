const express = require('express');
const router = express.Router();
const Dua = require('../models/dua');
const { logger } = require('../utils/logger');

// @route   GET /api/duas
// @desc    Get all duas
// @access  Public
router.get('/', async (req, res) => {
  try {
    const duas = await Dua.getAllDuas();
    res.json(duas);
  } catch (error) {
    logger.error(`Error fetching duas: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/duas/subcategory/:subcategoryId
// @desc    Get duas by subcategory ID
// @access  Public
router.get('/subcategory/:subcategoryId', async (req, res) => {
  try {
    const duas = await Dua.getDuasBySubcategoryId(req.params.subcategoryId);
    res.json(duas);
  } catch (error) {
    logger.error(`Error fetching duas by subcategory: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/duas/:id
// @desc    Get a single dua
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const dua = await Dua.getDuaById(req.params.id);
    if (!dua) {
      return res.status(404).json({ error: 'Dua not found' });
    }
    res.json(dua);
  } catch (error) {
    logger.error(`Error fetching dua: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 