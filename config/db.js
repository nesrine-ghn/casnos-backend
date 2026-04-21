require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "appuser$&casnos",
  database: process.env.DB_NAME || "casnos",
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;