const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/shop.db';
const dbDir = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database tables
 */
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          console.log('Users table ready');
        }
      });

      // Products table
      db.run(`
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
      `, (err) => {
        if (err) {
          console.error('Error creating products table:', err);
          reject(err);
        } else {
          console.log('Products table ready');
          // Insert sample products
          insertSampleProducts();
          resolve();
        }
      });
    });
  });
};

/**
 * Insert sample products for testing
 */
const insertSampleProducts = () => {
  const sampleProducts = [
    {
      name: 'Laptop',
      description: 'High-performance laptop for work and gaming',
      price: 999.99,
      stock: 15,
      category: 'Electronics',
      image_url: 'https://via.placeholder.com/300x200?text=Laptop'
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 29.99,
      stock: 50,
      category: 'Electronics',
      image_url: 'https://via.placeholder.com/300x200?text=Mouse'
    },
    {
      name: 'Coffee Maker',
      description: 'Automatic coffee maker with timer',
      price: 79.99,
      stock: 20,
      category: 'Home Appliances',
      image_url: 'https://via.placeholder.com/300x200?text=Coffee+Maker'
    },
    {
      name: 'Running Shoes',
      description: 'Comfortable running shoes for all terrains',
      price: 89.99,
      stock: 30,
      category: 'Sports',
      image_url: 'https://via.placeholder.com/300x200?text=Shoes'
    },
    {
      name: 'Backpack',
      description: 'Durable backpack with multiple compartments',
      price: 49.99,
      stock: 25,
      category: 'Accessories',
      image_url: 'https://via.placeholder.com/300x200?text=Backpack'
    }
  ];

  // Check if products already exist
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products:', err);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO products (name, description, price, stock, category, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleProducts.forEach(product => {
        stmt.run(
          product.name,
          product.description,
          product.price,
          product.stock,
          product.category,
          product.image_url
        );
      });

      stmt.finalize(() => {
        console.log('Sample products inserted');
      });
    }
  });
};

/**
 * Run a query that returns multiple rows
 */
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Run a query that returns a single row
 */
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Run a query that modifies data (INSERT, UPDATE, DELETE)
 */
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  query,
  get,
  run
};
