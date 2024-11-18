import React from 'react'
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';
import Features from '../components/Features';
const Mis = () => {
    return (
      <div className='flex flex-col bg-[#0A0A23] gap-10'>
          <Hero/>
          <Features/>
          <About/>
          <Contact/>
      </div>
    )
  }
  
  export default Mis