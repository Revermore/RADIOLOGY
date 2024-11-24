import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Admin from "./admin";
import AiEng from "./AiEng";
import Mis from "./mis";

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useRef(null);
  const [loading, setLoading] = useState(true); // Tracks loading state

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored User from localStorage:", storedUser); // Debugging log

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed User:", parsedUser); // Debugging log
        user.current = parsedUser;
      } catch (err) {
        console.error("Error parsing user:", err);
        navigate("/"); // Redirect if parsing fails
      }
    } else {
      console.warn("No user found in localStorage, redirecting to login.");
      navigate("/"); // Redirect if user is not in localStorage
    }
    setLoading(false); // Mark loading as done
  }, [navigate]);

  // While loading, show a fallback
  if (loading) return <p>Loading...</p>;

  // Handle roles
  if (user.current?.role === "Radiologist") {
    return (
      <div className="bg-[#0A0A23] h-full flex flex-col gap-20">
        <Header />
        <Mis />
        <Footer />
      </div>
    );
  } else if (user.current?.role === "Admin") {
    return (
      <div className="bg-[#0A0A23] h-full flex flex-col gap-20">
        <Header />
        <Admin />
        <Footer />
      </div>
    );
  } else if (user.current?.role === "AI Engineer") {
    return (
      <div className="bg-[#0A0A23] h-full flex flex-col gap-20">
        <Header />
        <AiEng />
        <Footer />
      </div>
    );
  }

  return <p>Unauthorized role</p>;
};

export default LandingPage;
