// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/Users");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Signup request received:", req.body); // Log the request body for debugging

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("Email already exists");
      return res.status(400).json({ error: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role, // Default to 'guest' role if no role provided
    });

    await user.save();

    console.log("User created:", user);
    res.status(201).json({
      message: "User created successfully!",
      user: { name, email, role: user.role },
    });
  } catch (error) {
    console.error("Error during signup:", error); // Detailed logging for errors
    res.status(500).json({ error: "Error signing up user!" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found!" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials!" });

    // Generate a JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role }, // Payload
      "your-secret-key", // Replace with a secure secret in .env
      { expiresIn: "5h" } // Token expiry
    );

    // Send back user data including role
    res.status(200).json({
      message: "Logged in successfully!",
      user: {
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in!" });
  }
});

module.exports = router;
