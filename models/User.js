const bcrypt = require('bcryptjs');
const { query, get, run } = require('../database/db');

class User {
  /**
   * Create a new user
   */
  static async create(username, email, password) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      
      return {
        id: result.id,
        username,
        email
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const user = await get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    try {
      const user = await get(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const user = await get(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [id]
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get all users (without passwords)
   */
  static async getAll() {
    try {
      const users = await query(
        'SELECT id, username, email, created_at FROM users'
      );
      return users;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
