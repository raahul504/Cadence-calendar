const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database table
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        description TEXT,
        color TEXT
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { pool, initDB };