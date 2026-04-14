require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");
const metaRoutes = require("./routes/meta");
const departmentRoutes = require("./routes/departments");  
const roleRoutes = require("./routes/roles");              
const serviceCatalogRoutes = require("./routes/serviceCatalog");
const app = express();
const ticketRoutes = require("./routes/tickets");

app.use(cors({
  origin: ["https://casnos-frontend.vercel.app", "http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/meta", metaRoutes);
app.use("/users", userRoutes);
app.use("/departments", departmentRoutes);  
app.use("/roles", roleRoutes);              
app.use("/tickets", ticketRoutes);
app.use("/services", serviceCatalogRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("CASNOS IT API WORKING");
});

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});