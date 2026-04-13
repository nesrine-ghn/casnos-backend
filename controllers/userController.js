const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// GET all users
exports.getUsers = (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
};

// GET one user
exports.getUser = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM users WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
};

// REGISTER user
exports.register = async (req, res) => {
  const { firstname, lastname, department_id, role_id, email, password, phone } = req.body;

  if (!firstname || !lastname || !email || !password || !department_id || !role_id || !phone)
    return res.status(400).json({ message: "Missing fields" }); // ✅

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (id, firstname, lastname, department_id, role_id, email, password, phone, is_active) VALUES (?,?,?,?,?,?,?,?,?)";

  db.query(sql, [id, firstname, lastname, department_id, role_id, email, hashedPassword, phone, 0], (err, result) => {
    if (err) return res.status(500).json({ message: err.message }); // ✅ now you'll see the actual DB error
    res.status(201).json({ message: "User registered. Awaiting admin activation." }); 
  });
};

// LOGIN user
exports.login = (req, res) => {
  const { email, password } = req.body;

  // join roles table to get the role name
  const sql = `
    SELECT users.*, roles.name as role 
    FROM users 
    JOIN roles ON users.role_id = roles.id 
    WHERE users.email = ?
  `;

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = result[0];
    // CHECK IF ACCOUNT IS ACTIVE
    if (!user.is_active) {
      return res.status(403).json({ message: "Account not activated. Please contact admin." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, // role name now included
        "secretkey",
        { expiresIn: "1h" }
      );
      res.json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
};

// UPDATE user
exports.updateUser = (req, res) => {
  const id = req.params.id;
  const { firstname, lastname, role_id, email, phone } = req.body;
  const sql = "UPDATE users SET firstname=?, lastname=?, role_id=?, email=?, phone=? WHERE id=?";
  db.query(sql, [firstname, lastname, role_id, email, phone, id], (err, result) => {
    if (err) return res.send(err);
    res.json({ message: "User updated" });
  });
};

// DELETE user
exports.deleteUser = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM users WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.send(err);
    res.json({ message: "User deleted" });
  });
};

// ACTIVATE user
exports.activateUser = (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE users SET is_active = 1 WHERE id = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "User activated successfully" });
  });
};

// DEACTIVATE user
exports.deactivateUser = (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE users SET is_active = 0 WHERE id = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "User deactivated successfully" });
  });
};