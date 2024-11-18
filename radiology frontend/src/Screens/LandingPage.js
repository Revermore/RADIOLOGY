import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Mis from './mis';
const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }else{
      navigate("/")
    }
  }, []);
  if(user){
  return (
    <div className='flex flex-col gap-20'>
        <Header/>
        <Mis/>
        <Footer/>
    </div>
  )}
}

export default LandingPage