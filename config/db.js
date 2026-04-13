const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "appuser",
  password: "appuser$&casnos",
  database: "casnos_db"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;