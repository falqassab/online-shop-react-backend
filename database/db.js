const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Determine if we're using PostgreSQL or SQLite
const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
  // PostgreSQL for production (Render)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  db = {
    query: async (sql, params = []) => {
      const result = await pool.query(sql, params);
      return result.rows;
    },
    get: async (sql, params = []) => {
      const result = await pool.query(sql, params);
      return result.rows[0];
    },
    run: async (sql, params = []) => {
      const result = await pool.query(sql, params);
      return { 
        id: result.rows[0]?.id,
        changes: result.rowCount 
      };
    }
  };
} else {
  // SQLite for development
  const sqlite3 = require('sqlite3').verbose();
  const DB_PATH = process.env.DB_PATH || './database/shop.db';
  const dbDir = path.dirname(DB_PATH);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  sqliteDb.run('PRAGMA foreign_keys = ON');

  db = {
    query: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    get: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    run: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      });
    }
  };
}

/**
 * Initialize database tables
 */
const initializeDatabase = async () => {
  try {
    if (isProduction) {
      // PostgreSQL schema
      await db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          stock INTEGER DEFAULT 0,
          image_url VARCHAR(500),
          category VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('PostgreSQL tables ready');
      
      // Insert sample products for production (first time only)
      const products = await db.query('SELECT COUNT(*) as count FROM products');
      if (products[0].count === '0' || products[0].count === 0) {
        const sampleProducts = [
          ['Laptop', 'High-performance laptop for work and gaming', 999.99, 15, 'Electronics', 'https://via.placeholder.com/300x200?text=Laptop'],
          ['Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 50, 'Electronics', 'https://via.placeholder.com/300x200?text=Mouse'],
          ['Coffee Maker', 'Automatic coffee maker with timer', 79.99, 20, 'Home Appliances', 'https://via.placeholder.com/300x200?text=Coffee+Maker'],
          ['Running Shoes', 'Comfortable running shoes for all terrains', 89.99, 30, 'Sports', 'https://via.placeholder.com/300x200?text=Shoes'],
          ['Backpack', 'Durable backpack with multiple compartments', 49.99, 25, 'Accessories', 'https://via.placeholder.com/300x200?text=Backpack']
        ];

        for (const product of sampleProducts) {
          await db.query(
            'INSERT INTO products (name, description, price, stock, category, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
            product
          );
        }
        console.log('Sample products inserted into PostgreSQL');
      }
    } else {
      // SQLite schema
      await db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          stock INTEGER DEFAULT 0,
          image_url TEXT,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('SQLite tables ready');
      
      // Insert sample products for development
      const products = await db.query('SELECT COUNT(*) as count FROM products');
      if (products[0].count === 0) {
        const sampleProducts = [
          ['Laptop', 'High-performance laptop', 999.99, 15, 'Electronics', 'https://via.placeholder.com/300x200?text=Laptop'],
          ['Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 50, 'Electronics', 'https://via.placeholder.com/300x200?text=Mouse'],
          ['Coffee Maker', 'Automatic coffee maker', 79.99, 20, 'Home Appliances', 'https://via.placeholder.com/300x200?text=Coffee+Maker'],
          ['Running Shoes', 'Comfortable running shoes', 89.99, 30, 'Sports', 'https://via.placeholder.com/300x200?text=Shoes'],
          ['Backpack', 'Durable backpack', 49.99, 25, 'Accessories', 'https://via.placeholder.com/300x200?text=Backpack']
        ];

        for (const product of sampleProducts) {
          await db.run(
            'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            product
          );
        }
        console.log('Sample products inserted');
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  db,
  initializeDatabase,
  query: db.query,
  get: db.get,
  run: db.run
};
