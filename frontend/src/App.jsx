import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/users/${id}`);
      setProfilePicture(response.data.profilePicture);
      setName(response.data.name);
      setEmail(response.data.email);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 404) {
        localStorage.removeItem("userId");
        setUserId(null);
        alert("User not found. Please create a new user.");
      } else {
        alert("An error occurred while fetching user data.");
      }
    }
  };

  const handleCreateUser = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("profilePicture", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:3000/users",
        formData
      );
      const createdUser = response.data;
      setUserId(createdUser._id);
      localStorage.setItem("userId", createdUser._id);
      setProfilePicture(createdUser.profilePicture);
      alert("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user.");
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Nur erste datei annehmen
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });
  const handleUpload = async () => {
    if (!userId) {
      alert("Create a user first.");
      return;
    }

    console.log("Uploading picture for user ID:", userId);

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);

    try {
      const response = await axios.put(
        `http://localhost:3000/users/${userId}`,
        formData
      );
      setProfilePicture(response.data.profilePicture);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture.");
    }
  };

  const handleDelete = async () => {
    if (!userId) {
      alert("No user to delete.");
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/users/${userId}`);
      setProfilePicture("");
      setUserId(null);
      localStorage.removeItem("userId");
      setName("");
      setEmail("");
      alert("User and profile picture deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response && error.response.status === 404) {
        alert("User not found or already deleted.");
        setUserId(null);
        localStorage.removeItem("userId");
      } else {
        alert("Failed to delete user.");
      }
    }
  };

  return (
    <div className="App">
      <h1>User Profile Management</h1>

      {!userId ? (
        <div>
          <h2>Create New User</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #007bff",
              padding: "20px",
              textAlign: "center",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the picture here ...</p>
            ) : (
              <p>
                Drag 'n' drop a profile picture here, or click to select one
              </p>
            )}
          </div>
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
          <button onClick={handleCreateUser}>Create User</button>
        </div>
      ) : (
        <div>
          <h2>Profile Picture</h2>
          {profilePicture ? (
            <div>
              <img src={profilePicture} alt="Profile" style={{ width: 150 }} />
            </div>
          ) : (
            <p>No profile picture uploaded.</p>
          )}
          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #007bff",
              padding: "20px",
              textAlign: "center",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the picture here ...</p>
            ) : (
              <p>
                Drag 'n' drop a new profile picture here, or click to select one
              </p>
            )}
          </div>
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
          <button onClick={handleUpload}>Upload/Replace Profile Picture</button>
          <button onClick={handleDelete}>Logout/Delete User</button>
        </div>
      )}
    </div>
  );
}

export default App;
