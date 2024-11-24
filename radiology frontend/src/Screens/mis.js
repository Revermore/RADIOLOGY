import React from "react";
import Hero from "../components/Hero";
import Else from "./Else";
const Mis = () => {
  return (
    <div className="flex flex-col bg-[#0A0A23] gap-32 h-full">
      <Hero className="h-auto" />
      <Else />
    </div>
  );
};

export default Mis;
