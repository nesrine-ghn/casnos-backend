const bcrypt = require("bcrypt");
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createAdmin = async () => {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash("admin123", 10);

  db.query(
    "INSERT INTO users (id, firstname, lastname, email, password, role_id) VALUES (?,?,?,?,?,?)",
    [id, "Super", "Admin", "nesrineghenaiar@gmail.com", hashedPassword, "5"],
    (err, result) => {
      if (err) console.log("Error:", err);
      else console.log("Admin created successfully");
      process.exit();
    }
  );
};

createAdmin();