const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

dotenv.config();

// set up cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "D10ATest",
    public_id: (req, file) => `profile_picture_${new Date().toISOString()}`,
  },
});

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

const upload = multer({ storage: storage });

// Routes

// Create new user with profile picture
app.post("/users", upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const profilePicture = req.file.path;

    const user = new User({ name, email, profilePicture });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// get user
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// update profile picture
app.put("/users/:id", upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.profilePicture) {
      const publicIdMatch = user.profilePicture.match(
        /\/v\d+\/(.+)\.(jpg|jpeg|png|gif)$/
      );

      if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        await cloudinary.uploader.destroy(publicId);
      } else {
        console.error("Failed to find public id");
      }
    }

    user.profilePicture = req.file.path;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// delete user and profile pic
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.profilePicture) {
      const regex = /\/([^/]+)\.(jpg|jpeg|png|gif)$/;
      const match = user.profilePicture.match(regex);

      if (match) {
        const publicId = match[1];
        await cloudinary.uploader.destroy(`D10ATest/${publicId}`);
      } else {
        console.log("Failed to find profile picture id");
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User and pfp deleted" });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
