import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [res, setRes] = useState(null);
  const TABLE_HEAD = ["Dcm series", ""]; // Table headers
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);

      // Fetch folders under the doctor's email
      const fetchFolders = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/getFolders?email=${user.email}`
          );

          console.log("Received folders:", response.data);
          setRes(response.data); // Store folder data
        } catch (error) {
          console.error("Error fetching folders:", error);
        }
      };

      fetchFolders();
    }
  }, []);

  const ViewFolder = async (e) => {
    try {
      console.log(e.target.id);
      const response = await axios.get(
        `http://localhost:8000/getFolderContents`,
        {
          params: {
            email: user.email,
            folderName: e.target.id,
          },
        }
      );
      console.log("Folder contents:", response.data);

      // Navigate to the viewer with folder contents
      navigate("/DcmViewer", { state: [response.data, e.target.id] }); // #TODO changed this
    } catch (error) {
      console.error("Error fetching folder contents:", error);
      // Add user feedback
      alert("Error loading folder contents. Please try again.");
    }
  };

  return (
    <div className="hero py-14 mt-4">
      <section className="bg-[#0A0A23] h-full flex flex-col justify-center items-center text-center">
        {/* Main Title */}
        <h1 className="navbar-brand text-white text-7xl tracking-wider leading-tight shadow-lg my-6 mt-20">
          DIGICLINICS - R<em className="text-red-500 font-bold">.AI.</em>
          DIOLOGY
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
        {res && (
          <div className="w-screen flex flex-col justify-center items-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl text-[#60CFFF] font-bold text-center">
              Unannotated Dicom Series
            </h1>
            <table className="mt-4 table-auto text-center rounded-lg w-1/3">
              <thead className="bg-indigo-500">
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                    >
                      <Typography
                        variant="h4"
                        color="black"
                        className="font-normal leading-none"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {res.map((folderName, index) => {
                  const isLast = index === res.length - 1;
                  const classes = isLast
                    ? "p-2"
                    : "p-2 border-b border-blue-gray-50 ";

                  return (
                    <tr key={folderName} className="">
                      <td className={classes}>
                        <Typography
                          variant="h5"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {folderName}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Button
                          variant="gradient"
                          className="flex items-center gap-3"
                          size="sm"
                          id={folderName}
                          onClick={ViewFolder}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Hero;
