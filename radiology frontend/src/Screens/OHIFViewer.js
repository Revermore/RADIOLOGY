import React, { useRef, useState } from "react";
import {
  Button,
} from "@material-tailwind/react";

const OHIFViewer = (props) => {
  const yap = useRef(null);
  const [resultImageUrl, setResultImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [maskFile, setMaskFile] = useState(null);

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

      try {
        const res = await fetch("http://localhost:5001/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error(
            "Failed to upload image and mask to Flask server:",
            res.status,
            res.statusText
          );
          return;
        }

        let data = await res.json();
        console.log("Upload response:", data);

        let resultImageUrl = data.combined_image;
        setResultImageUrl(resultImageUrl);
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
    <div className="bg-[#0A0A23] h-full w-full">
      <Button color="red" className="mt-4 ml-4 text-md" onClick={handleGoBack}>Back</Button>
    <div className="bg-[#0A0A23] h-full flex flex-col justify-center items-center text-center overflow-y-visible">
      <h1 className="p-4 text-7xl text-center text-[#60CFFF] font-body">
        Mammogram Prediction
      </h1>
      <div className="bg-white">
        <input
          type="file"
          accept="image/png"
          onChange={handleImageUpload} // Upload handler for the image
        />
        <p className="text-black text-sm">Upload Image</p>
      </div>
      <div className="bg-white">
        <input
          type="file"
          accept="image/png"
          onChange={handleMaskUpload} // Upload handler for the mask
        />
        <p className="text-black text-sm">Upload Mask</p>
      </div>
      <div className="bg-indigo-200 w-full h-[850px] m-8 flex-col rounded-lg items-center justify-center">
        <div className="m-2 flex justify-evenly">
          <button onClick={uploadToFlask}>Upload</button>
        </div>
        <div className="flex gap-10">
          <div
            className="m-4 bg-white w-full h-[600px] rounded-lg mx-auto"
            ref={yap}
          >
            {resultImageUrl && (
              <img
                src={resultImageUrl}
                alt="Result"
                className="w-full h-full object-cover rounded-lg w-"
              />
            )}
            {!resultImageUrl && (
              <p className="text-black text-2xl my-auto">
                No result loaded yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default OHIFViewer;

// import { Button } from "@material-tailwind/react";
// import React, { useRef, useState } from "react";

// const OHIFViewer = (props) => {
//   const viewerRef = useRef(null);
//   const yap = useRef(null);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [image, setImage] = useState(null);
//   const [there, isThere] = useState(false);
//   const [fileName, setName] = useState("");

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0]; // Get the first file
//     setName(file.name);
//     if (there) {
//       yap.current.style.backgroundImage = ``;
//     }
//     if (file) {
//       const imageUrl = URL.createObjectURL(file); // Create URL for the image
//       setImage(imageUrl); // Store the image URL in state

//       // Display the image in the viewer div
//       if (viewerRef.current) {
//         viewerRef.current.style.backgroundImage = `url(${imageUrl})`;
//         viewerRef.current.style.backgroundSize = "cover";
//         viewerRef.current.style.backgroundRepeat = "no-repeat";
//         viewerRef.current.style.backgroundPosition = "center";
//       }

//       setImageLoaded(true); // Mark that image is loaded
//     }
//   };

//   const uploadToFlask = async () => {
//     if (image) {
//       // Ensure both image and mask are available
//       const formData = new FormData();

//       // Fetch the image as a blob
//       const imageResponse = await fetch(image);
//       const imageBlob = await imageResponse.blob();
//       formData.append("image", imageBlob, "uploaded_image.png"); // Append the image blob
//       try {
//         // Send the form data to the Flask server
//         const res = await fetch("http://localhost:5001/upload", {
//           method: "POST",
//           body: formData,
//         });

//         if (!res.ok) {
//           console.error(
//             "Failed to upload image to Flask server:",
//             res.status,
//             res.statusText
//           );
//           return;
//         }

//         let data = await res.json();
//         console.log("Upload response:", data);

//         let resultImageUrl = data.combined_image;

//         // Set the fetched image as the background image of the div with ref = {yap}
//         let viewerDiv = yap.current; // Assuming yap is a ref to your div
//         if (viewerDiv) {
//           viewerDiv.style.backgroundImage = `url(${resultImageUrl})`;
//           viewerDiv.style.backgroundSize = "cover";
//           viewerDiv.style.backgroundRepeat = "no-repeat";
//           viewerDiv.style.backgroundPosition = "center";

//           // Optionally hide any "No image loaded" message
//           let noImageMessage = viewerDiv.querySelector("p");
//           if (noImageMessage) {
//             noImageMessage.style.display = "none";
//           }
//         }
//         isThere(true);
//       } catch (error) {
//         console.error("Error during upload or fetching result:", error);
//       }
//     } else {
//       console.error("Image and mask must be provided.");
//     }
//   };

//   return (
//     <div className="bg-[#0A0A23] h-screen flex flex-col justify-center items-center text-center overflow-y-visible">
//       <h1 className="p-4 text-7xl text-center text-[#60CFFF] font-body mt-4">
//         Mammogram Prediction
//       </h1>
//       <div className="bg-white">
//         <input
//           type="file"
//           accept="image/png" // Accept only PNG images
//           onChange={handleFileUpload} // Change the handler to handle single file upload
//         />
//       </div>
//       <div className=" bg-indigo-200 w-[1250px] h-[850px] m-8 flex-col rounded-lg items-center justify-center">
//         <div className="m-2 flex justify-evenly">
//           <Button ripple={true} color="red" onClick={uploadToFlask}>
//             Upload
//           </Button>
//         </div>
//         <div className="flex gap-10">
//           <div
//             className="m-4 bg-white w-[550px] h-[600px] rounded-lg mx-auto"
//             ref={viewerRef}
//           >
//             {!imageLoaded && (
//               <p className="text-black text-2xl my-auto">No image loaded yet</p>
//             )}
//           </div>
//           <div
//             className="m-4 bg-white w-[550px] h-[600px] rounded-lg mx-auto"
//             ref={yap}
//           >
//             {!imageLoaded && (
//               <p className="text-black text-2xl my-auto">No image loaded yet</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OHIFViewer;
