const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorite');
const auth = require('../middleware/auth');
const { logger } = require('../utils/logger');

// @route   POST /api/favorites
// @desc    Add a dua to favorites
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { duaId, subcategoryId } = req.body;
    
    // Validation
    if (!duaId) {
      return res.status(400).json({ error: 'Dua ID is required' });
    }
    
    if (!subcategoryId) {
      return res.status(400).json({ error: 'Subcategory ID is required' });
    }
    
    const result = await Favorite.addToFavorites(req.user.userId, duaId, subcategoryId);
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Error adding to favorites: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/favorites/:duaId
// @desc    Remove a dua from favorites
// @access  Private
router.delete('/:duaId', auth, async (req, res) => {
  try {
    const { duaId } = req.params;
    
    // Validation
    if (!duaId) {
      return res.status(400).json({ error: 'Dua ID is required' });
    }
    
    const result = await Favorite.removeFromFavorites(req.user.userId, duaId);
    res.json(result);
  } catch (error) {
    logger.error(`Error removing from favorites: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/favorites
// @desc    Get all user favorites
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.getUserFavorites(req.user.userId);
    res.json(favorites);
  } catch (error) {
    logger.error(`Error getting favorites: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/favorites/check/:duaId
// @desc    Check if a dua is in favorites
// @access  Private
router.get('/check/:duaId', auth, async (req, res) => {
  try {
    const { duaId } = req.params;
    
    // Validation
    if (!duaId) {
      return res.status(400).json({ error: 'Dua ID is required' });
    }
    
    const result = await Favorite.isInFavorites(req.user.userId, duaId);
    res.json(result);
  } catch (error) {
    logger.error(`Error checking favorite: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 