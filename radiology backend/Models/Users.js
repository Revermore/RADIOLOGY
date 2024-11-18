// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Admin", "Radiologist", "Guest"], // Only these 3 roles allowed
    default: "Guest", // Default role is guest
  },
});

module.exports = mongoose.model("User", userSchema);
