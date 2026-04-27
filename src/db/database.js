// Database initialization and connection
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '../../salary.db');
const db = new Database(dbPath);

// Create employees table
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    country TEXT NOT NULL,
    salary REAL NOT NULL
  )
`);

module.exports = db;
