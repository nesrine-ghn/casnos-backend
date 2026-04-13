const db = require("../config/db");

// GET all roles (excluding admin)
exports.getRoles = (req, res) => {
  const sql = "SELECT * FROM roles WHERE name != 'admin'";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};