const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");
const metaRoutes = require("./routes/meta");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/meta", metaRoutes); 
app.use("/users", userRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("CASNOS IT API WORKING");
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});