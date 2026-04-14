const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

router.get("/", verifyToken, (req, res) => {
  db.query("SELECT * FROM roles", (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
});

router.post("/", verifyToken, isAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  db.query("INSERT INTO roles (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: "Role created", id: result.insertId });
  });
});

router.put("/:id", verifyToken, isAdmin, (req, res) => {
  const { name } = req.body;
  db.query("UPDATE roles SET name=? WHERE id=?", [name, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Role updated" });
  });
});

router.delete("/:id", verifyToken, isAdmin, (req, res) => {
  db.query("DELETE FROM roles WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Role deleted" });
  });
});

module.exports = router;