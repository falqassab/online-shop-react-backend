const bcrypt = require('bcryptjs');
const { query, get, run } = require('../database/db');

// Check if we're in production (PostgreSQL) or development (SQLite)
const isProduction = process.env.NODE_ENV === 'production';

class User {
  /**
   * Create a new user
   */
  static async create(username, email, password) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const sql = isProduction
        ? 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id'
        : 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      
      const result = await run(sql, [username, email, hashedPassword]);
      
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
      const sql = isProduction
        ? 'SELECT * FROM users WHERE email = $1'
        : 'SELECT * FROM users WHERE email = ?';
      
      const user = await get(sql, [email]);
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
      const sql = isProduction
        ? 'SELECT * FROM users WHERE username = $1'
        : 'SELECT * FROM users WHERE username = ?';
      
      const user = await get(sql, [username]);
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
      const sql = isProduction
        ? 'SELECT id, username, email, created_at FROM users WHERE id = $1'
        : 'SELECT id, username, email, created_at FROM users WHERE id = ?';
      
      const user = await get(sql, [id]);
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
