const { query, get, run } = require('../database/db');

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
      const product = await get(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
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
      const products = await query(
        'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC',
        [category]
      );
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
      
      const result = await run(
        `INSERT INTO products (name, description, price, stock, category, image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, price, stock || 0, category, image_url]
      );
      
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
      
      await run(
        `UPDATE products 
         SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ?
         WHERE id = ?`,
        [name, description, price, stock, category, image_url, id]
      );
      
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
      const result = await run(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
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
      const products = await query(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC',
        [`%${searchTerm}%`, `%${searchTerm}%`]
      );
      return products;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
