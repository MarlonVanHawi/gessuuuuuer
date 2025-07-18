const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ensure database is stored in a persistent location
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'users.db');

// Connect to a database file. If the file does not exist, it will be created.
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create the users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error("Error creating users table", err.message);
      } else {
        // Add total_score column if it doesn't exist
        db.all("PRAGMA table_info(users)", (err, rows) => {
            const columnExists = rows && rows.some(row => row.name === 'total_score');
            if (!columnExists) {
                db.run('ALTER TABLE users ADD COLUMN total_score INTEGER DEFAULT 0', (alterErr) => {
                    if (alterErr) {
                        console.error("Error adding total_score column", alterErr.message);
                    }
                });
            }
        });
      }
    });
  }
});

module.exports = db;
