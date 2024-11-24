import {
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  Input,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkDicomHeader } from "./dicomUtils"; // Adjust the path if needed

const Admin = () => {
  const TABLE_HEAD = ["ID", "Doctor name", "Email", "Department", ""]; // Table headers
  const navigate = useNavigate();
  const [radiologists, setRadiologists] = useState([]); // Doctors' data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false); // Dialog state
  const [docid, setDocid] = useState("");
  const [dirname, setDirname] = useState(""); // Directory name state
  const uploadedFiles = useRef([]);
  // Fetch and authenticate user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }

    const fetchRadiologists = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/auth/radiologists"
        );
        setRadiologists(response.data); // Set fetched data
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching radiologists:", err);
        setError("Failed to fetch radiologists.");
      } finally {
        setLoading(false);
      }
    };

    fetchRadiologists();
  }, [navigate]);

  const validateUploadedFiles = async (files) => {
    try {
      for (const file of files) {
        const fileUrl = URL.createObjectURL(file); // Temporarily create a blob URL
        const isValid = await checkDicomHeader(fileUrl);
        if (!isValid) throw new Error(`Invalid DICOM file: ${file.name}`);
      }
      console.log("All files are valid DICOM files!");
      return true;
    } catch (err) {
      console.error("File validation failed:", err.message);
      alert(
        "One or more files are invalid DICOM files. Please check and try again."
      );
      return false;
    }
  };

  // Log changes to the directory name
  useEffect(() => {
    if (dirname) {
      console.log("Directory Name Set:", dirname);
    }
  }, [dirname]);

  // Handle file upload
  const Upload = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;
    console.log(event.target);
    console.log("Files selected:", files); // Debug log
    for (let i = 0; i < files.length; i++) {
      uploadedFiles.current.push(files[i]);
    }
    setDocid(event.target.id);
    setOpen(true); // Open dialog for folder name input
  };

  // Handle directory name input
  const onChangeName = ({ target }) => setDirname(target.value);

  // Finalize folder upload process
  const Summ = async () => {
    if (dirname) {
      const isValid = await validateUploadedFiles(uploadedFiles.current);
      if (!isValid) return; // Stop if validation fails
      console.log("Folder Name Confirmed:", dirname);
      console.log("Uploaded Files:", uploadedFiles);
      console.log(docid);
      setOpen(false); // Close the dialog
      // Add backend logic to send `uploadedFiles` and `dirname` to the server
      // Prepare form data for the POST request
      const doctor = radiologists.find((doc) => doc._id == docid);
      if (!doctor) {
        console.error("Doctor not found!");
        alert("Doctor information not found. Please try again.");
        return;
      }

      const doctorEmail = doctor.email;
      console.log("Doctor email:", doctorEmail);

      setOpen(false);
      const formData = new FormData();
      uploadedFiles.current.forEach((file) => {
        formData.append("dicomImages", file); // Attach files
      });
      formData.append("folderName", dirname); // Attach folder name
      formData.append("email", doctorEmail); // Attach doctor ID
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      try {
        // Send POST request to the file server
        const response = await axios.post(
          "http://localhost:8000/uploadFolder",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Folder uploaded successfully:", response.data);
        alert("Folder uploaded sucessfully!");
        setOpen(false); // Close the dialog
      } catch (error) {
        console.error("Error uploading folder:", error);
        alert("Failed to upload folder. Please try again.");
      } finally {
        uploadedFiles.current = [];
        setDirname("");
        setDocid(-1);
      }
    } else {
      console.warn("Directory name is required!");
    }
  };

  return (
    <div className="bg-[#0A0A23] h-screen flex flex-col">
      <h1 className="text-white text-5xl mt-20 text-center">ADMIN</h1>
      <div className="flex flex-col justify-center items-center text-center">
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="flex flex-col items-center w-screen mt-10">
            <h1 className="text-2xl text-white">Doctor - Upload Dicom Series folder</h1>
            <table className="mt-4 table-auto text-center w-4/6">
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
                {radiologists.map(({ _id, name, email, role }, index) => {
                  const isLast = index === radiologists.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={name}>
                      <td className={classes}>
                        <Typography
                          variant="h5"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {_id}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="h5"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {name}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="h5"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {email}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="h5"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {role}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Button
                          variant="gradient"
                          className="flex items-center gap-3 justify-center relative w-full h-full"
                          size="lg"
                        >
                          <label className="absolute inset-0 flex items-center justify-center gap-3 cursor-pointer">
                            <input
                              id={_id}
                              onChange={Upload} // Trigger Upload function
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              type="file"
                              webkitdirectory="true"
                              directory="true"
                            />
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                              />
                            </svg>
                            <p className="my-auto">Upload</p>
                          </label>
                        </Button>
                        <Dialog open={open} className="flex flex-col" size="sm">
                          <DialogHeader className="mx-auto">
                            Set Folder Name
                          </DialogHeader>
                          <DialogBody className="gap-5 flex flex-col mx-auto bg-white">
                            <div className="flex">
                              <div className="relative flex w-full max-w-[24rem]">
                                <Input
                                  type="text"
                                  label="Enter folder name"
                                  value={dirname}
                                  onChange={onChangeName}
                                  className="pr-20"
                                  containerProps={{
                                    className: "min-w-0",
                                  }}
                                />
                                <Button
                                  size="sm"
                                  color={dirname ? "blue" : "gray"}
                                  disabled={!dirname}
                                  className="!absolute right-1 top-1 rounded"
                                  onClick={Summ}
                                >
                                  Confirm
                                </Button>
                              </div>
                            </div>
                          </DialogBody>
                        </Dialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
