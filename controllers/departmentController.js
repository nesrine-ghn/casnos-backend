const db = require("../config/db");

// GET all departments
exports.getDepartments = (req, res) => {
  const sql = "SELECT * FROM departments";
  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
};