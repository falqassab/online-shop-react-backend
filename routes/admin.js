const express = require('express');
const router = express.Router();
const { query, run } = require('../database/db');
const { auth } = require('../middleware/auth');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 * @access  Private
 */
router.get('/users', auth, async (req, res, next) => {
  try {
    const users = await query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private
 */
router.delete('/users/:id', auth, async (req, res, next) => {
  try {
    const sql = isProduction
      ? 'DELETE FROM users WHERE id = $1'
      : 'DELETE FROM users WHERE id = ?';
    
    await run(sql, [req.params.id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/products
 * @desc    Get all products (admin only)
 * @access  Private
 */
router.get('/products', auth, async (req, res, next) => {
  try {
    const products = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete('/products/:id', auth, async (req, res, next) => {
  try {
    const sql = isProduction
      ? 'DELETE FROM products WHERE id = $1'
      : 'DELETE FROM products WHERE id = ?';
    
    await run(sql, [req.params.id]);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/clear-all
 * @desc    Clear all data (DANGEROUS - use with caution)
 * @access  Private
 */
router.delete('/clear-all', auth, async (req, res, next) => {
  try {
    await run('DELETE FROM products');
    await run('DELETE FROM users');
    
    res.json({
      success: true,
      message: 'All data cleared successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
