import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false); // For popup visibility
  const [errorMessage, setErrorMessage] = useState(""); // To store error text
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email: username,
        password,
      });

      const { user, token } = response.data;

      // Store the token and user details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to home page after successful login
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err);

      if (err.response) {
        // Backend provided an error response
        const { status, data } = err.response;
        if (status === 404 || status === 400) {
          setErrorMessage(data.error); // User not found or invalid credentials
        } else if (status === 500) {
          setErrorMessage("Server error. Please try again later.");
        } else {
          setErrorMessage("Unexpected error occurred.");
        }
      } else {
        // Network or other issues
        setErrorMessage("Unable to connect to the server. Please try again.");
      }

      // Show popup
      setShowErrorPopup(true);

      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 3000);
    }
  };

  return (
    <div className="login">
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A23]">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
          <div className="flex justify-center mb-6">
            <h1 className="font-bold text-2xl text-[#60CFFF]">
              DIGICLINICS - R<em className="text-red-500 font-bold">.AI.</em>
              DIOLOGY
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-center text-white">
            Sign in to your account
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400"
              >
                Email
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                name="email"
                id="email"
                className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400"
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                id="password"
                className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Login
            </button>

            <p className="text-sm text-center text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500">
                Sign up
              </Link>
            </p>
          </form>

          {/* Error Popup */}
          {showErrorPopup && (
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-4 rounded-md shadow-md">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
