import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(username + " " + email + " " + password + " " + role);
    try {
      const response = await axios.post("http://localhost:5000/auth/signup", {
        name: username,
        email,
        password,
        role, // Optional: if role is not provided, it defaults to 'AI Engineer'
      });

      // Create a folder for the Radiologist after successful signup
      if (role === "Radiologist") {
        console.log("Creating folder for:", email);
        try {
          const folderResponse = await axios.post(
            "http://localhost:8000/createFolder",
            { email }, // Ensure the body is being sent correctly
            {
              headers: { "Content-Type": "application/json" }, // Explicitly set content type
            }
          );
          console.log("Folder creation successful:", folderResponse.data);
        } catch (folderError) {
          console.error("Error creating folder for the doctor:", folderError);
          alert("Failed to create folder for the doctor.");
        }
      }
      // Redirect to login after signup success
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-[#0A0A23] min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        {/* Logo or Icon */}
        <div className="flex justify-center mb-6">
          {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-12 h-12 text-indigo-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.963 9.963 0 01-5.121-1.804L2 22l3.121-4.196z"
              />
            </svg> */}
          <h1 className="font-bold text-2xl text-[#60CFFF]">
            DIGICLINICS - R<em className="text-red-500 font-bold">.AI.</em>
            DIOLOGY
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white">Sign up</h2>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-400"
            >
              Name
            </label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              name="username"
              id="username"
              className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
            />
          </div>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400"
            >
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              id="email"
              className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-400"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="Radiologist">Radiologist</option>
              <option value="AI Engineer">AI Engineer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="password"
              id="password"
              className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Signup
          </button>

          {/* Trial */}
          <p className="text-sm text-center text-gray-400">
            Already have an account?
            <Link to="/" className="text-blue-500">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default SignUp;
