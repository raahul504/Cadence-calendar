const express = require("express");
const cors = require("cors");
const { pool, initDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database on startup
initDB();

// Get all events
app.get("/events", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date, time');
    const formattedEvents = result.rows.map(event => ({
      ...event,
      date: event.date instanceof Date 
        ? `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}-${String(event.date.getDate()).padStart(2, '0')}`
        : event.date
    }));
    res.json(formattedEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create event
app.post("/events", async (req, res) => {
   const { title, date, time, description, color } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO events (title, date, time, description, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, date, time, description, color]
    );
    const formattedEvent = {
      ...result.rows[0],
      date: result.rows[0].date instanceof Date 
        ? `${result.rows[0].date.getFullYear()}-${String(result.rows[0].date.getMonth() + 1).padStart(2, '0')}-${String(result.rows[0].date.getDate()).padStart(2, '0')}`
        : result.rows[0].date
    };
    res.json(formattedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update event
app.put("/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, date, time, description, color } = req.body;
  try {
    const result = await pool.query(
      'UPDATE events SET title=$1, date=$2, time=$3, description=$4, color=$5 WHERE id=$6 RETURNING *',
      [title, date, time, description, color, id]
    );
    const formattedEvent = {
      ...result.rows[0],
      date: result.rows[0].date instanceof Date 
        ? `${result.rows[0].date.getFullYear()}-${String(result.rows[0].date.getMonth() + 1).padStart(2, '0')}-${String(result.rows[0].date.getDate()).padStart(2, '0')}`
        : result.rows[0].date
    };
    res.json(formattedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete event
app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM events WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));