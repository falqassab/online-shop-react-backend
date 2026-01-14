const { query, get, run } = require('../database/db');

// Check if we're in production (PostgreSQL) or development (SQLite)
const isProduction = process.env.NODE_ENV === 'production';

class Product {
  /**
   * Get all products
   */
  static async getAll() {
    try {
      const products = await query(
        'SELECT * FROM products ORDER BY created_at DESC'
      );
      return products;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async findById(id) {
    try {
      const sql = isProduction
        ? 'SELECT * FROM products WHERE id = $1'
        : 'SELECT * FROM products WHERE id = ?';
      
      const product = await get(sql, [id]);
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by category
   */
  static async getByCategory(category) {
    try {
      const sql = isProduction
        ? 'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC';
      
      const products = await query(sql, [category]);
      return products;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new product
   */
  static async create(productData) {
    try {
      const { name, description, price, stock, category, image_url } = productData;
      
      const sql = isProduction
        ? `INSERT INTO products (name, description, price, stock, category, image_url)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
        : `INSERT INTO products (name, description, price, stock, category, image_url)
           VALUES (?, ?, ?, ?, ?, ?)`;
      
      const result = await run(sql, [name, description, price, stock || 0, category, image_url]);
      
      return await this.findById(result.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a product
   */
  static async update(id, productData) {
    try {
      const { name, description, price, stock, category, image_url } = productData;
      
      const sql = isProduction
        ? `UPDATE products 
           SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6
           WHERE id = $7`
        : `UPDATE products 
           SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ?
           WHERE id = ?`;
      
      await run(sql, [name, description, price, stock, category, image_url, id]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a product
   */
  static async delete(id) {
    try {
      const sql = isProduction
        ? 'DELETE FROM products WHERE id = $1'
        : 'DELETE FROM products WHERE id = ?';
      
      const result = await run(sql, [id]);
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search products by name
   */
  static async search(searchTerm) {
    try {
      const sql = isProduction
        ? 'SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $2 ORDER BY created_at DESC'
        : 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC';
      
      const products = await query(sql, [`%${searchTerm}%`, `%${searchTerm}%`]);
      return products;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
