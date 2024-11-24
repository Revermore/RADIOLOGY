import React from "react";
import About from '../components/About';
import Contact from '../components/Contact';
import Features from '../components/Features';
const Else = () => {
    return (
      <div className='flex flex-col bg-[#0A0A23] gap-10 h-full'>
          <Features/>
          <About/>
          <Contact/>
      </div>
    )
  }
  
  export default Else