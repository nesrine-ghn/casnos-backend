require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL");
    //initializeTabletickets();
  }
});
/*
function initializeTabletickets() {
  const createupdatedticketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
      id varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      title varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
      description text COLLATE utf8mb4_general_ci,
      priority enum('low','medium','high','critical') COLLATE utf8mb4_general_ci DEFAULT 'medium',
      status enum('new','assigned','in_progress','resolved','closed') COLLATE utf8mb4_general_ci DEFAULT 'new',
      created_by varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      assigned_to varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      service_id int DEFAULT NULL,
      created_at datetime DEFAULT CURRENT_TIMESTAMP,
      updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      resolved_at datetime DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `;
  db.query(createupdatedticketsTable, (err) => {
    if (err) {
      console.log("⚠️ Error creating tickets table:", err.message);
    } else {
      console.log("✅ tickets table ready");
    }
  });
}

// 👇 Auto-create tables on startup
function initializeTables() {
  const createServiceCatalogTable = `
    CREATE TABLE IF NOT EXISTS servicecatalog (
      id int NOT NULL,
      name varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
      description text COLLATE utf8mb4_general_ci,
      category varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
      sla_hours int DEFAULT '24',
      department_id int DEFAULT NULL,
      is_active tinyint(1) DEFAULT '1'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createTicketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
 id varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
 title varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
 description text COLLATE utf8mb4_general_ci,
 priority enum('low','medium','high','critical') COLLATE utf8mb4_general_ci DEFAULT 'medium',
 status enum('new','assigned','in_progress','resolved','closed') COLLATE utf8mb4_general_ci DEFAULT 'new',
 created_by varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
 assigned_to varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
 service_id int DEFAULT NULL,
 created_at datetime DEFAULT CURRENT_TIMESTAMP,
 updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 resolved_at datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  // Create servicecatalog table
  db.query(createServiceCatalogTable, (err) => {
    if (err) {
      console.log("⚠️ Error creating servicecatalog table:", err.message);
    } else {
      console.log("✅ servicecatalog table ready");
    }
  });

  // Create tickets table
  db.query(createTicketsTable, (err) => {
    if (err) {
      console.log("⚠️ Error creating tickets table:", err.message);
    } else {
      console.log("✅ tickets table ready");
    }
  });
}
*/

module.exports = db;