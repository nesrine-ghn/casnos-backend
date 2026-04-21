const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { v4: uuidv4 } = require("uuid");

// GET all tickets (admin + agent)
router.get("/", verifyToken, (req, res) => {
  const sql = `
    SELECT tickets.*, 
      users.firstname, users.lastname,
      servicecatalog.name as service_name
    FROM tickets
    LEFT JOIN users ON tickets.created_by = users.id
    LEFT JOIN servicecatalog ON tickets.service_id = servicecatalog.id
    ORDER BY tickets.created_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
});

// GET my tickets (employee)
router.get("/my", verifyToken, (req, res) => {
  const sql = `
    SELECT tickets.*, 
      servicecatalog.name as service_name
    FROM tickets
    LEFT JOIN servicecatalog ON tickets.service_id = servicecatalog.id
    WHERE tickets.created_by = ?
    ORDER BY tickets.created_at DESC
  `;
  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
});

// POST create ticket
router.post("/", verifyToken, (req, res) => {
  const { title, description, priority, service_id } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });
  const id = uuidv4();
  db.query(
    "INSERT INTO tickets (id, title, description, priority, service_id, created_by) VALUES (?,?,?,?,?,?)",
    [id, title, description, priority || "medium", service_id || null, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Ticket created", id });
    }
  );
});

// PUT update ticket status (agent + admin)
router.put("/:id", verifyToken, (req, res) => {
  const { status, assigned_to } = req.body;
  db.query(
    "UPDATE tickets SET status=?, assigned_to=?, updated_at=NOW() WHERE id=?",
    [status, assigned_to, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Ticket updated" });
    }
  );
});

module.exports = router;