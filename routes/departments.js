const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

// GET all
router.get("/", verifyToken, (req, res) => {
  db.query("SELECT * FROM departments", (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
});

// POST create
router.post("/", verifyToken, isAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  db.query("INSERT INTO departments (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: "Department created", id: result.insertId });
  });
});

// PUT update
router.put("/:id", verifyToken, isAdmin, (req, res) => {
  const { name } = req.body;
  db.query("UPDATE departments SET name=? WHERE id=?", [name, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Department updated" });
  });
});

// DELETE
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
  db.query("DELETE FROM departments WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Department deleted" });
  });
});

module.exports = router;