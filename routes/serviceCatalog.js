const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

// GET all active services (everyone can see)
router.get("/", verifyToken, (req, res) => {
  db.query("SELECT * FROM service_catalog WHERE is_active = 1", (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
});

// POST create service (admin only)
router.post("/", verifyToken, isAdmin, (req, res) => {
  const { name, description, category, sla_hours, department_id } = req.body;
  if (!name || !category) return res.status(400).json({ message: "Name and category are required" });
  db.query(
    "INSERT INTO service_catalog (name, description, category, sla_hours, department_id) VALUES (?,?,?,?,?)",
    [name, description, category, sla_hours || 24, department_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Service created", id: result.insertId });
    }
  );
});

// PUT update service (admin only)
router.put("/:id", verifyToken, isAdmin, (req, res) => {
  const { name, description, category, sla_hours, is_active } = req.body;
  db.query(
    "UPDATE service_catalog SET name=?, description=?, category=?, sla_hours=?, is_active=? WHERE id=?",
    [name, description, category, sla_hours, is_active, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Service updated" });
    }
  );
});

// DELETE service (admin only)
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
  db.query("DELETE FROM service_catalog WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Service deleted" });
  });
});

module.exports = router;