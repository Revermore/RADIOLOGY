import React, { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import { FaBars } from 'react-icons/fa'; // Import the FaBars icon
import {Link as RouterLink} from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [transparent, setTransparent] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        window.addEventListener('scroll', () => {
            window.scrollY > 50 ? setTransparent(true) : setTransparent(false);
        });
    }, []);

    const toggleMenu = () => {
        setMobileMenu(!mobileMenu);
    };

    const logout = () => {
        // Clear user data and token
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Redirect to login page
  navigate("/");
    }

    return (
        <nav className={`fixed w-full z-10 transition-all duration-300 ${transparent ? 'bg-[#301934]' : 'bg-[#301934]'} shadow-lg`}>
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                {/* Text Heading */}
                <h1 className="text-white font-bold text-2xl flex"><Link to='hero' smooth={true} offset={0} duration={500} className="hover:text-gray-300 cursor-pointer flex">DIGICLINICS R. <h1 className='text-red-600'> AI </h1> .DIOLOGY</Link></h1>

                {/* Menu Items */}
                <ul className={`flex space-x-6 items-center text-white ${mobileMenu ? '' : 'hidden md:flex'}`}> 
                    <li><Link to='hero' smooth={true} offset={0} duration={500} className="hover:text-gray-300 cursor-pointer">Home</Link></li>
                    <li><Link to='features' smooth={true} offset={-70} duration={500} className="hover:text-gray-300 cursor-pointer">Features</Link></li>
                    <li><Link to='about' smooth={true} offset={-60} duration={500} className="hover:text-gray-300 cursor-pointer">About</Link></li>
                    <li><Link to='contact' smooth={true} offset={-40} duration={500} className="hover:text-gray-300 cursor-pointer">Contact</Link></li>
                    <li><p onClick={logout} className="btn bg-white text-purple-700 px-4 py-2 rounded hover:bg-gray-200 cursor-pointer">Log-out</p></li>
                </ul>

                {/* Menu Icon for Mobile using FaBars */}
                <FaBars className="h-8 w-8 text-white cursor-pointer md:hidden" onClick={toggleMenu} />
            </div>

            {/* Mobile Menu */}
            {mobileMenu && (
                <ul className="md:hidden bg-[#301934] text-white text-center space-y-4 py-4">
                    <li><Link to='hero' smooth={true} offset={0} duration={500} className="block hover:bg-purple-800 py-2">Home</Link></li>
                    <li><Link to='features' smooth={true} offset={-260} duration={500} className="block hover:bg-purple-800 py-2">Features</Link></li>
                    <li><Link to='about' smooth={true} offset={-150} duration={500} className="block hover:bg-purple-800 py-2">About</Link></li>
                    <li><Link to='contact' smooth={true} offset={-260} duration={500} className="block hover:bg-purple-800 py-2">Contact</Link></li>
                    <li><RouterLink to='/' className="block bg-white text-purple-700 py-2 rounded hover:bg-gray-200">Log-out</RouterLink></li>
                </ul>
            )}
        </nav>
    );
};

export default Header;
