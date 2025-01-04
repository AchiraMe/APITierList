// index.js
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = 3000; // เปลี่ยน port ตามต้องการ

// Middleware
app.use(express.json());
app.use(require('cors')());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      process.exit(1);
    }
    console.log('Connected to MySQL database');
  });
  

// Example API endpoint
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json({ result: results[0].result });
  });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
