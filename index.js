const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(express.json());
app.use(cors()); // ใช้ middleware CORS

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
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

// GET: ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    res.json(results);
  });
});

app.post('/api/addusers', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  const query = 'INSERT INTO users (username, email) VALUES (?, ?)';
  db.query(query, [username, email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add user' });
    }
    res.json({ message: 'User added successfully', userId: results.insertId });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
