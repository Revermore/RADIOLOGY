import React, { useRef, useState } from "react";

const OHIFViewer = (props) => {
  // const [resultImageUrl, setResultImageUrl] = useState("");
  const [malignantImageUrl, setMalignantImageUrl] = useState("");
  const [benignImageUrl, setBenignImageUrl] = useState("");
  const [malignantImageFile, setMalignantImageFile] = useState(null);
  const [malignantMaskFile, setMalignantMaskFile] = useState(null);
  const [benignImageFile, setBenignImageFile] = useState(null);
  const [benignMaskFile, setBenignMaskFile] = useState(null);

  const handleMalignantImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMalignantImageFile(file);
    }
  };

  const handleMalignantMaskUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMalignantMaskFile(file);
    }
  };

  const handleBenignImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBenignImageFile(file);
    }
  };

  const handleBenignMaskUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBenignMaskFile(file);
    }
  };

  const uploadToFlask = async () => {
    if (malignantImageFile && malignantMaskFile) {
      const formData = new FormData();

      formData.append("image", malignantImageFile);
      formData.append("mask", malignantMaskFile);

      try {
        const res = await fetch("http://localhost:5001/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error(
            "Failed to upload malignant image and mask to Flask server:",
            res.status,
            res.statusText
          );
          return;
        }

        let data = await res.json();
        console.log("Upload response:", data);

        let resultImageUrl = data.combined_image;
        setMalignantImageUrl(resultImageUrl);
      } catch (error) {
        console.error("Error during upload or fetching result:", error);
      }
    } else {
      console.error("Both malignant image and mask must be provided.");
    }
  };

  const uploadToFlaskBenign = async () => {
    if (benignImageFile && benignMaskFile) {
      const formData = new FormData();

      formData.append("image", benignImageFile);
      formData.append("mask", benignMaskFile);

      try {
        const res = await fetch("http://localhost:5001/uploadbenign", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error(
            "Failed to upload benign image and mask to Flask server:",
            res.status,
            res.statusText
          );
          return;
        }

        let data = await res.json();
        console.log("Upload response:", data);

        let resultImageUrl = data.combined_image;
        setBenignImageUrl(resultImageUrl);
      } catch (error) {
        console.error("Error during upload or fetching result:", error);
      }
    } else {
      console.error("Both benign image and mask must be provided.");
    }
  };

  return (
    <div className="bg-[#0A0A23] h-screen flex flex-col justify-center items-center text-center overflow-y-visible">
      <h1 className="p-4 text-7xl text-center text-[#60CFFF] font-body mt-4">
        Mammogram Prediction
      </h1>

      {/* Malignant Upload Section */}
      <div className="bg-white">
        <input
          type="file"
          accept="image/png"
          onChange={handleMalignantImageUpload}
        />
        <p className="text-black text-sm">Upload Malignant Image</p>
      </div>
      <div className="bg-white">
        <input
          type="file"
          accept="image/png"
          onChange={handleMalignantMaskUpload}
        />
        <p className="text-black text-sm">Upload Malignant Mask</p>
      </div>
      <div className="bg-indigo-200 w-[1250px] h-[850px] m-8 flex-col rounded-lg items-center justify-center">
        <div className="m-2 flex justify-evenly">
          <button onClick={uploadToFlask}>Upload Malignant Data</button>
        </div>
        <div className="flex gap-10">
          <div className="m-4 bg-white w-[550px] h-[600px] rounded-lg mx-auto">
            {malignantImageUrl && (
              <img
                src={malignantImageUrl}
                alt="Malignant Prediction Result"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            {!malignantImageUrl && (
              <p className="text-black text-2xl my-auto">
                No malignant result loaded yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Benign Upload Section */}
      <div className="bg-white">
        <input
          type="file"
          accept="image/png"
          onChange={handleBenignImageUpload}
        />
        <p className="text-black text-sm">Upload Benign Image</p>
      </div>
      <div className="bg-white">
        <input
          type="file"
          accept="image/png"
          onChange={handleBenignMaskUpload}
        />
        <p className="text-black text-sm">Upload Benign Mask</p>
      </div>
      <div className="bg-indigo-200 w-[1250px] h-[850px] m-8 flex-col rounded-lg items-center justify-center">
        <div className="m-2 flex justify-evenly">
          <button onClick={uploadToFlaskBenign}>Upload Benign Data</button>
        </div>
        <div className="flex gap-10">
          <div className="m-4 bg-white w-[550px] h-[600px] rounded-lg mx-auto">
            {benignImageUrl && (
              <img
                src={benignImageUrl}
                alt="Benign Prediction Result"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            {!benignImageUrl && (
              <p className="text-black text-2xl my-auto">
                No benign result loaded yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OHIFViewer;
