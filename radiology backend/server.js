const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");
const app = express();
const PORT = 5000;

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);
// MongoDB connection
const dbURI =
  "mongodb+srv://pguruprasad204:zZLSFq0TRwcdfoFf@dccluster.cbfty.mongodb.net/"; // Put your MongoDB Atlas connection string here

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("Failed to connect to MongoDB:", err));

// Example route
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
