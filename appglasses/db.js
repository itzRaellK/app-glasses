// db.js
const sqlite3 = require('sqlite3').verbose();

// Create/Open the database file
const db = new sqlite3.Database('./orders.db', err => {
  if (err) console.error('Error! Database connection failed:', err);
  else console.log('Connected to the orders.db');
});

// Inicialize the orders db
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_name TEXT UNIQUE,
      client_name TEXT,
      pieces INTEGER,
      nf_code TEXT,
      receipt_code TEXT,
      total_value REAL,
      entry REAL,
      remaining_amount REAL,
      date TEXT 
    )
  `);
});

module.exports = db;
