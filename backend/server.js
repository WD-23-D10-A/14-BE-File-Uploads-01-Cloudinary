const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/cloudinaryDB", {
  useUnifiedTopology: true,
});

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  profilePicture: String,
});

const User = mongoose.model("User", userSchema);

// Set up Express app
const app = express();
app.use(express.json());
app.use(cors());

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
