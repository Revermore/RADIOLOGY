import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  return (
    <div className="hero py-14">
      <section className="bg-[#0A0A23] h-screen flex flex-col justify-center items-center text-center">
        {/* Main Title */}
        <h1 className="navbar-brand text-white text-7xl tracking-wider leading-tight shadow-lg my-6 mt-20">
          DIGICLINICS - R<em className="text-red-500 font-bold">.AI.</em>DIOLOGY
        </h1>
        <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#60CFFF] font-bold my-6">
          Extensible Mammogram web imaging
          <br /> platform for radiologists
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-gray-400 mb-8">
          Create custom workflows with user-friendly interfaces. <br />
          Review cases and report results quickly, zero installation required.
        </p>
        <div className="flex gap-10">
          {/* border-spacing-x-10 border border-white */}
          {/* <Card className="my-6 w-96 h-auto pt-10 pb-4 ml-6 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105">
            <CardHeader color="blue-gray" className="h-80">
              <img className="h-80" src={ct6a} alt="card-image" />
            </CardHeader>
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Covid-CT
              </Typography>
              <Typography>
                By using our sophisticated AI the doctors will be able to
                quickly predict whether a person is exposed to COVID or not
              </Typography>
            </CardBody>
          </Card> */}
          <Card
            className="my-6 w-96 h-auto pt-10 pb-4 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => navigate("/DcmViewer")}
          >
            <CardHeader color="blue-gray" className="h-80">
              <img
                className="h-80"
                src="https://claroty.com/img/asset/YXNzZXRzL3RlYW04Ml9icmFpbi1zY2Fucy5qcGc=/team82_brain-scans.jpg?fm=webp&fit=crop&s=298eab08d49fe63481f1e5f38eb2b5a5"
                alt="card-image"
              />
            </CardHeader>
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                DICOM Viewer
              </Typography>
              <Typography>
                A software that uses cornerstone tools to view DICOM series.
              </Typography>
            </CardBody>
          </Card>
          <Card
            className="my-6 w-96 h-auto pt-10 pb-4 mr-6 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => navigate("/MammoPred")}
          >
            <CardHeader color="blue-gray" className="h-80">
              <img
                className="h-80 w-full"
                src="https://user-images.githubusercontent.com/52899958/62762210-2c83da00-babb-11e9-9377-23f92987d0d4.png"
                alt="card-image"
              />
            </CardHeader>
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Mammogram Prediction
              </Typography>
              <Typography>
                By using our sophisticated AI the doctors will be able to
                quickly predict whether a person has breast cancer or not.
              </Typography>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Hero;
