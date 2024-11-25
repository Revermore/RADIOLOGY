import React, { useState } from "react";
import {
  Button,
} from "@material-tailwind/react";

const OHIFViewer = () => {
  const [selectedType, setSelectedType] = useState("benign");
  const [imageFile, setImageFile] = useState(null);
  const [maskFile, setMaskFile] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleMaskUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMaskFile(file);
    }
  };

  const uploadToFlask = async () => {
    if (imageFile && maskFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("mask", maskFile);

      const endpoint =
        selectedType === "malignant"
          ? "http://localhost:5001/upload"
          : "http://localhost:5001/uploadbenign";

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error(
            `Failed to upload ${selectedType} data to Flask server:`,
            res.status,
            res.statusText
          );
          return;
        }

        const data = await res.json();
        console.log("Upload response:", data);
        setResultImageUrl(data.combined_image);
      } catch (error) {
        console.error("Error during upload or fetching result:", error);
      }
    } else {
      console.error("Both image and mask must be provided.");
    }
  };
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="bg-[#0A0A23] h-full">
      <Button color="red" className="mt-4 ml-4 text-md" onClick={handleGoBack}>
        Back
      </Button>
    <div className="bg-[#0A0A23] h-screen flex flex-col items-center text-center">
      <h1 className="p-4 text-7xl text-[#60CFFF] font-body mb-8">
        Mammogram Prediction
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center w-auto">
        {/* Radio Buttons */}
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="benign"
              checked={selectedType === "benign"}
              onChange={() => setSelectedType("benign")}
            />
            Benign
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="malignant"
              checked={selectedType === "malignant"}
              onChange={() => setSelectedType("malignant")}
            />
            Malignant
          </label>
        </div>

        {/* File Inputs */}
        <div className="mb-4 flex justify-center items-center">
        <p className="text-black text-xl mt-2">Upload {selectedType} Image:</p>
          <input
            type="file"
            accept="image/png"
            onChange={handleImageUpload}
            className="ml-2"
          />
        </div>
        <div className="flex justify-center items-center mb-4">
        <p className="text-black text-xl mt-2">Upload {selectedType} Mask:</p>
          <input
            type="file"
            accept="image/png"
            onChange={handleMaskUpload}
            className="ml-2"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={uploadToFlask}
          className="bg-[#60CFFF] text-white px-6 py-2 rounded-md hover:bg-[#45a8d6] transition"
        >
          Upload {selectedType} Data
        </button>
        
      </div>

      {/* Display Section */}
      <div className="bg-indigo-200 w-11/12 h-[400px] mt-8 rounded-lg flex items-center justify-center shadow-lg">
        {resultImageUrl ? (
          <img
            src={resultImageUrl}
            alt={`${selectedType} Prediction Result`}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <p className="text-black text-2xl">No result loaded yet</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default OHIFViewer;
