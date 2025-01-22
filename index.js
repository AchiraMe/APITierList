const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // นำเข้า jsonwebtoken
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3306;
const SECRET_KEY = process.env.JWT_SECRET;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database");
});

// Endpoint: Login and generate token
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const query = "SELECT id, username FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error fetching user info:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
      expiresIn: "1h", // Token หมดอายุใน 1 ชั่วโมง
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  });
});

// Middleware: Verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user; // เก็บข้อมูลผู้ใช้ใน req
    next();
  });
};

// Endpoint: Get user info (secured)
app.post("/api/getuserinfo", authenticateToken, (req, res) => {
  const { username } = req.user; // ใช้ข้อมูลจาก token
  const query = "SELECT username, email FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error fetching user info:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      username: results[0].username,
      email: results[0].email,
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
