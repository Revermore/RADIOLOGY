import React from 'react';
import { Link } from 'react-scroll';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub} from 'react-icons/fa';

const Footer = () => {
  return (
    <div className='footer'>
    <footer className="bg-[#0A0A23] py-10 px-4 md:px-8 lg:px-16 text-center">
      <div className="flex flex-col lg:flex-row justify-between items-center lg:text-left lg:space-x-8 space-y-6 lg:space-y-0">
        {/* Footer Links */}
        <div className="space-y-4 text-gray-400 space-x-4">
        <Link to='hero' smooth={true} offset={0} duration={500} className="hover:text-white transition cursor-pointer">Home</Link>
        <Link to='features' smooth={true} offset={-70} duration={500} className="hover:text-white transition cursor-pointer">Features</Link>
        <Link to='about' smooth={true} offset={-60} duration={500} className="hover:text-white transition cursor-pointer">About</Link>
        <Link to='contact' smooth={true} offset={-40} duration={500} className="hover:text-white transition cursor-pointer">Contact</Link>
          <Link to='about' smooth={true} offset={-60} duration={500} className="hover:text-white transition cursor-pointer">About</Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-6 text-[#60CFFF]">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF className="text-2xl hover:text-white transition duration-300" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-2xl hover:text-white transition duration-300" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn className="text-2xl hover:text-white transition duration-300" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <FaGithub className="text-2xl hover:text-white transition duration-300" />
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 text-gray-400">
        <p>© 2024 Radiology v2.0. All rights reserved.</p>
      </div>
    </footer>
    </div>
  );
};

export default Footer;
