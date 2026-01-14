const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route   GET /api/products
 * @desc    Get all products or search products
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;

    let products;

    if (search) {
      products = await Product.search(search);
    } else if (category) {
      products = await Product.getByCategory(category);
    } else {
      products = await Product.getAll();
    }

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
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product with image upload
 * @access  Private
 */
router.post('/', auth, upload.single('image'), async (req, res, next) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name and price'
      });
    }

    // Get Cloudinary image URL if uploaded
    const image_url = req.file ? req.file.path : null;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image_url
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private
 */
router.put('/:id', auth, upload.single('image'), async (req, res, next) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Use new Cloudinary URL if image uploaded, otherwise keep existing
    const image_url = req.file ? req.file.path : existingProduct.image_url;

    const product = await Product.update(req.params.id, {
      name,
      description,
      price,
      stock,
      category,
      image_url
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const deleted = await Product.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
