import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
} from "@material-tailwind/react";
import axios from "axios";
import cornerstone from "cornerstone-core";
import cornerstoneMath from "cornerstone-math";
import cornerstoneTools from "cornerstone-tools";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init();

const Dcmvi = (props) => {
  const location = useLocation();
  let ass = location.state; // Access the 'res' object here
  let res;
  let finalDirName;
  const [dirname, setDirname] = useState(""); // Directory name state
  useEffect(() => {
    if (ass && ass[1] !== finalDirName) {
      // Ensure the dirname is only set when it changes
      console.log(ass);
      res = ass[0];
      setDirname(ass[1]); // Set state only if ass[1] is different
      finalDirName = ass[1]; // Update the local variable (finalDirName) as well
    }
  }, [ass]); // Add ass as a dependency so it only runs when ass changes
  const [user, setUser] = useState(null);
  const viewerRef = useRef(null);
  const yap = useRef(null);
  const q1 = useRef(null);
  const q2 = useRef(null);
  const um = useRef(false);
  const finalMasks = useRef([]);
  const coords = useRef([]);
  let editedOnly = useRef([]);
  const imagesLOL = useRef([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isStackScrollEnabled, setIsStackScrollEnabled] = useState(false);
  const [activeTool, setActiveTool] = useState(""); // Track active tool
  const [dragStartY, setDragStartY] = useState(null);
  const [jsonobj, setJsonobj] = useState("");
  const [clicked, setClicked] = useState(false);
  const [open, setOpen] = React.useState(false);
  const currentIndexRef = useRef(0);
  const [j, setJ] = useState(0);
  // const allAnnotations = {};
  const handleOpen = () => setOpen(!open);
  // Toggle stack scroll
  const handleStackScrollToggle = () => {
    setIsStackScrollEnabled(!isStackScrollEnabled);
  };

  // Function to handle mouse drag for scrolling through images
  const handleMouseDown = (event) => {
    if (!isStackScrollEnabled || !imageLoaded) return;
    setDragStartY(event.clientY);
  };

  const handleMouseUp = () => {
    setDragStartY(null);
  };

  const handleMouseMove = useCallback(
    (event) => {
      if (!isStackScrollEnabled || dragStartY === null) return;

      const dragDistance = event.clientY - dragStartY;

      if (Math.abs(dragDistance) > 10) {
        const direction = dragDistance > 0 ? 1 : -1;
        const currentLength = imagesLOL.current?.length || 0;

        let newIndex = currentIndexRef.current + direction;

        // Ensure we stay within bounds
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= currentLength) newIndex = currentLength - 1;

        console.log("newIndex = " + newIndex);
        currentIndexRef.current = newIndex; // Update the ref directly

        updateTheImage(newIndex); // Use the updated index
        if (clicked) {
          showMask();
        }
        setDragStartY(event.clientY); // Update drag start for smooth scrolling
      }
    },
    [dragStartY, isStackScrollEnabled]
  );
  // Function to update the displayed image based on index
  const updateTheImage = async (index) => {
    try {
      const image = await cornerstone.loadImage(imagesLOL.current[index]);
      const { columns, rows } = image;
      console.log("Width:", columns, "Height:", rows);
      cornerstone.displayImage(viewerRef.current, image);
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 10);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      cornerstoneTools.init();
      const element = viewerRef.current;
      cornerstone.enable(element);

      // Load the tools once
      const tools = [
        cornerstoneTools.PanTool,
        cornerstoneTools.ZoomTool,
        cornerstoneTools.LengthTool,
        cornerstoneTools.ProbeTool,
        cornerstoneTools.AngleTool,
        cornerstoneTools.EraserTool,
        cornerstoneTools.FreehandRoiTool,
        cornerstoneTools.EllipticalRoiTool,
        cornerstoneTools.MagnifyTool,
        cornerstoneTools.RotateTool,
        cornerstoneTools.WwwcTool,
        cornerstoneTools.RectangleRoiTool,
      ];

      tools.forEach((tool) => {
        try {
          cornerstoneTools.addTool(tool);
        } catch (err) {
          console.log("Error adding tool:", err);
        }
      });

      // Async loading of images
      const loadImage = async () => {
        finalDirName = ass[1];
        console.log("Directory name is set! " + finalDirName);
        // Make sure to clear the file manager FIRST
        cornerstoneWADOImageLoader.wadouri.fileManager.purge();
        const loadedImageIds = [];
        const negate = res.length;

        // Process all files in a single batch
        const allFilePromises = res.map(async (file) => {
          console.log(user.email + "   " + file.name);
          const fileUrl = `http://localhost:8000/getFile?email=${user.email}&folderName=${finalDirName}&fileName=${file.name}`;
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error(`Failed to fetch file: ${fileUrl}`);
          return response.blob();
        });

        try {
          // Wait for all files to be fetched
          const fileBlobs = await Promise.all(allFilePromises);

          // Now add them all in sequence
          fileBlobs.forEach((blob) => {
            const imageId =
              cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);
            // Extract the number from dicomfile:XX
            let number = parseInt(imageId.split(":")[1]);

            // If number is >= negate (87 in your case), subtract negate
            if (number >= negate) {
              number = number - negate;
            }

            // Store in the correct position in loadedImageIds array
            loadedImageIds[number] = `dicomfile:${number}`;
          });

          // Filter out any undefined entries and ensure array is dense
          const finalImageIds = loadedImageIds.filter((id) => id !== undefined);

          // Set the ref only once all files are processed and sorted
          imagesLOL.current = finalImageIds;
          console.log(imagesLOL.current);

          if (viewerRef.current && finalImageIds.length > 0) {
            const firstImage = await cornerstone.loadImage(finalImageIds[0]);
            const { columns, rows } = firstImage;
            console.log("Width:", columns, "Height:", rows);
            cornerstone.displayImage(viewerRef.current, firstImage);
            setImageLoaded(true);
          }
        } catch (e) {
          console.error("Error in loadImage:", e);
        }
      };
      // Add flag to prevent double loading
      let isLoading = false;
      if (ass && !isLoading) {
        isLoading = true;
        loadImage();
      }

      return () => {
        cornerstone.disable(element);
        cornerstoneWADOImageLoader.wadouri.fileManager.purge();
      };
    }
  }, []);

  const handleFolderUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const loadedImageIds = [];

    for (const file of files) {
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      loadedImageIds.push(imageId);
    }
    imagesLOL.current = loadedImageIds;
    if (viewerRef.current && loadedImageIds.length > 0) {
      try {
        const firstImage = await cornerstone.loadImage(loadedImageIds[0]);
        const { columns, rows } = firstImage;
        console.log("Width:", columns, "Height:", rows);
        cornerstone.displayImage(viewerRef.current, firstImage);
        setImageLoaded(true);
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
  };

  function collectAllAnnotations(imageIds) {
    const allAnnotations = {};
    let lmao = {};
    console.log(imageIds);
    imageIds.forEach((imageId) => {
      const toolState =
        cornerstoneTools.globalImageIdSpecificToolStateManager.saveImageIdToolState(
          imageId
        );
      if (toolState) {
        const keys = Object.keys(toolState);
        console.log(keys);
        console.log(toolState);
        allAnnotations[imageId] = {};
        lmao[imageId] = [];
        for (let i = 0; i < keys.length; i++) {
          const inner = toolState[keys[i]].data;
          if (keys[i] == "Probe") {
            allAnnotations[imageId][keys[i]] = [];
            for (let j = 0; j < inner.length; j++) {
              //just end
              if (inner[j].handles && inner[j].handles.end) {
                allAnnotations[imageId][keys[i]].push({
                  x: inner[j].handles.end.x,
                  y: inner[j].handles.end.y,
                });
                lmao[imageId].push([
                  {
                    x: inner[j].handles.end.x,
                    y: inner[j].handles.end.y,
                  },
                ]);
              } else {
                console.warn(
                  `Missing handles or end for ${keys[i]} at index ${j}`
                );
              }
            }
          } else if (keys[i] == "Angle") {
            allAnnotations[imageId][keys[i]] = [];
            for (let j = 0; j < inner.length; j++) {
              //start, end, middle
              if (
                inner[j].handles &&
                inner[j].handles.start &&
                inner[j].handles.middle &&
                inner[j].handles.end
              ) {
                allAnnotations[imageId][keys[i]].push({
                  x1: inner[j].handles.start.x,
                  y1: inner[j].handles.start.y,
                  x2: inner[j].handles.middle.x,
                  y2: inner[j].handles.middle.y,
                  x3: inner[j].handles.end.x,
                  y3: inner[j].handles.end.y,
                });
                lmao[imageId].push(
                  getAnglePoints(
                    inner[j].handles.start.x,
                    inner[j].handles.start.y,
                    inner[j].handles.middle.x,
                    inner[j].handles.middle.y,
                    inner[j].handles.end.x,
                    inner[j].handles.end.y
                  )
                );
              } else {
                console.warn(
                  `Missing handles or end for ${keys[i]} at index ${j}`
                );
              }
            }
          } else if (keys[i] == "FreehandRoi") {
            allAnnotations[imageId][keys[i]] = [];
            // console.log(inner[0].handles.points[0].x + "and" + inner[0].handles.points[0].y)
            for (let j = 0; j < inner.length; j++) {
              //Array
              let nig = [];
              for (let k = 0; k < inner[j].handles.points.length; k++) {
                nig.push({
                  x: inner[j].handles.points[k].x,
                  y: inner[j].handles.points[k].y,
                });
              }
              lmao[imageId].push(nig);
              allAnnotations[imageId][keys[i]].push(nig);
            }
          } else if (keys[i] == "EllipticalRoi") {
            allAnnotations[imageId][keys[i]] = [];
            for (let j = 0; j < inner.length; j++) {
              if (
                inner[j].handles &&
                inner[j].handles.start &&
                inner[j].handles.end
              ) {
                let points = [];
                const h =
                  (inner[j].handles.start.x + inner[j].handles.end.x) / 2;
                const k =
                  (inner[j].handles.start.y + inner[j].handles.end.y) / 2;
                const a = inner[j].handles.start.x - h;
                const b = inner[j].handles.start.y - k;
                const minDistance = 0.5;
                let theta = 0;
                let deltaTheta = 0.18; // initial increment in radians

                // Starting point at theta = 0
                let xPrev = h + a * Math.cos(theta);
                let yPrev = k + b * Math.sin(theta);
                points.push({ x: xPrev, y: yPrev });

                while (theta <= 2 * Math.PI) {
                  // Calculate new point
                  const x = h + a * Math.cos(theta);
                  const y = k + b * Math.sin(theta);

                  // Distance from previous point
                  const distance = Math.sqrt(
                    (x - xPrev) ** 2 + (y - yPrev) ** 2
                  );

                  if (distance >= minDistance) {
                    // Add point if far enough from the previous one
                    points.push({ x, y });
                    xPrev = x;
                    yPrev = y; // Update previous point
                  }

                  theta += deltaTheta;
                }
                allAnnotations[imageId][keys[i]].push(points);
                lmao[imageId].push(points);
              } else {
                console.warn(
                  `Missing handles or end for ${keys[i]} at index ${j}`
                );
              }
            }
          } else {
            allAnnotations[imageId][keys[i]] = [];
            for (let j = 0; j < inner.length; j++) {
              //start, end
              if (
                inner[j].handles &&
                inner[j].handles.start &&
                inner[j].handles.end
              ) {
                allAnnotations[imageId][keys[i]].push({
                  x1: inner[j].handles.start.x,
                  y1: inner[j].handles.start.y,
                  x2: inner[j].handles.end.x,
                  y2: inner[j].handles.end.y,
                });
                lmao[imageId].push(
                  getPoints(
                    keys[i],
                    inner[j].handles.start.x,
                    inner[j].handles.start.y,
                    inner[j].handles.end.x,
                    inner[j].handles.end.y
                  )
                );
              } else {
                console.warn(
                  `Missing handles or end for ${keys[i]} at index ${j}`
                );
              }
            }
          }
        }
      } else {
        //left empty on purpose!
        lmao[imageId] = [];
      }
    });
    coords.current[0] = lmao;
    console.log(coords.current);
    console.log(imagesLOL.current);
    for (let i = 0; i < imagesLOL.current.length; i++) {
      if (coords.current[0][`dicomfile:${i}`].length != 0) {
        if (editedOnly.current.indexOf(i) == -1) {
          editedOnly.current.push(i);
        }
      }
    }
    console.log(editedOnly.current);
    return JSON.stringify(allAnnotations, null, 2);
  }

  const getAnglePoints = (x1, y1, x2, y2, x3, y3) => {
    let lool = [];

    // Helper function to check if a point already exists in the array
    const addUniquePoint = (x, y) => {
      if (!lool.some((point) => point.x === x && point.y === y)) {
        lool.push({ x, y });
      }
    };

    // Function to add points between two coordinates with a step
    const addLinePoints = (xStart, yStart, xEnd, yEnd, step = 0.3) => {
      const m = (yEnd - yStart) / (xEnd - xStart);
      const c = yStart - m * xStart;
      const isAscending = xStart <= xEnd;

      for (
        let x = xStart;
        isAscending ? x <= xEnd : x >= xEnd;
        x += isAscending ? step : -step
      ) {
        const y = m * x + c;
        addUniquePoint(x, y);
      }
    };

    // First segment from (x1, y1) to (x2, y2)
    addLinePoints(x1, y1, x2, y2);

    // Second segment from (x2, y2) to (x3, y3)
    addLinePoints(x2, y2, x3, y3);

    // Ensure the last point (x3, y3) is added
    addUniquePoint(x3, y3);

    return lool;
  };

  const getPoints = (name, x1, y1, x2, y2) => {
    let lool = [];
    if (name === "RectangleRoi") {
      // Horizontal lines
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 0.3) {
        lool.push({ x, y: y1 });
        lool.push({ x, y: y2 });
      }
      // Vertical lines
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 0.3) {
        lool.push({ x: x1, y });
        lool.push({ x: x2, y });
      }
    } else if (name === "Length") {
      // Calculate points along the line
      if (x1 !== x2) {
        let m = (y2 - y1) / (x2 - x1);
        let c = y1 - m * x1;
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 0.3) {
          let y = m * x + c;
          lool.push({ x, y });
        }
      } else {
        // Vertical line case
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 0.3) {
          lool.push({ x: x1, y });
        }
      }
    }
    return lool;
  };

  //Download JSON File
  const JsonFile = () => {
    //Create a Blob from the JSON string
    const blob = new Blob([jsonobj], { type: "application/json" });

    //Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    //Ask the user to name the file (handled automatically by the browser on download)
    link.download = "annotations.json"; // default filename

    //Trigger the download
    link.click();
  };

  // Function to convert JSON to CSV
  const jsonToCSV = (jsonObject) => {
    const csvRows = [];

    // Get headers (keys)
    const headers = Object.keys(jsonObject);
    csvRows.push(headers.join(",")); // Join keys as CSV headers

    // Get values for each row
    const values = headers.map((key) => {
      const value = jsonObject[key];

      // If the value is an object or array, stringify it to prevent [object Object]
      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return value;
    });
    csvRows.push(values.join(",")); // Join values as CSV row

    return csvRows.join("\n"); // Return CSV string
  };

  //Download CSV File
  const csvDownload = () => {
    try {
      const jsonObject = JSON.parse(jsonobj); // Parse the JSON string into an object
      const csvString = jsonToCSV(jsonObject); // Convert JSON to CSV

      // Create Blob and download link
      const blob = new Blob([csvString], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "annotations.csv"; // Default file name
      link.click();
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  const handleMaskImages = (width = 512, height = 512) => {
    setClicked(true);
  };

  const createMasks = (width = 512, height = 512) => {
    if (yap.current) {
      yap.current.innerHTML = "";
      um.current = true;
      const masksArray = [];
      for (let i = 0; i < imagesLOL.current.length; i++) {
        // Create a 512x512 black image (array filled with zeroes)
        const blackMask = Array.from({ length: height }, () =>
          Array(width).fill(0)
        );
        masksArray.push(blackMask);
      }
      setTimeout(() => {
        displayMasks(masksArray); // Call the display function
      }, 200);
    }
  };

  // UseEffect to react to changes in the `clicked` state
  useEffect(() => {
    if (clicked) {
      createMasks(); // Run the mask creation logic
    }
  }, [clicked]); // Dependency on clicked state

  const displayMasks = (masksArray, width = 512, height = 512) => {
    masksArray.forEach((mask, currentImageId) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      // Fill canvas with black
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);

      // Create imageData for probe points
      const imageData = context.createImageData(width, height);

      // Fill mask from mask array
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * 4;
          let color = mask[y][x] * 255;

          imageData.data[pixelIndex] = color;
          imageData.data[pixelIndex + 1] = color;
          imageData.data[pixelIndex + 2] = color;
          imageData.data[pixelIndex + 3] = 255;
        }
      }

      // Process probe points
      if (coords.current[0][`dicomfile:${currentImageId}`]) {
        const points = coords.current[0][`dicomfile:${currentImageId}`].length;
        for (let i = 0; i < points; i++) {
          const annos = coords.current[0][`dicomfile:${currentImageId}`][i];
          if (
            coords.current[0][`dicomfile:${currentImageId}`][i].length === 1
          ) {
            const x = Math.floor(
              coords.current[0][`dicomfile:${currentImageId}`][i][0].x
            );
            const y = Math.floor(
              coords.current[0][`dicomfile:${currentImageId}`][i][0].y
            );

            if (
              Number.isFinite(x) &&
              Number.isFinite(y) &&
              x >= 0 &&
              x < width &&
              y >= 0 &&
              y < height
            ) {
              const pixelIndex = (y * width + x) * 4;
              imageData.data[pixelIndex] = 255;
              imageData.data[pixelIndex + 1] = 255;
              imageData.data[pixelIndex + 2] = 255;
              imageData.data[pixelIndex + 3] = 255;
            } else {
              console.error(`Point (${x}, ${y}) is out of bounds or invalid.`);
            }
          }
        }

        // Apply the modified imageData back to the canvas for all probes
        context.putImageData(imageData, 0, 0);

        // Now, process freehand or line-based annotations
        for (let i = 0; i < points; i++) {
          //points is number of annotations in one file
          if (coords.current[0][`dicomfile:${currentImageId}`][i].length > 1) {
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.beginPath();

            const firstPoint =
              coords.current[0][`dicomfile:${currentImageId}`][i][0];
            context.moveTo(firstPoint.x, firstPoint.y);

            coords.current[0][`dicomfile:${currentImageId}`][i].forEach(
              ({ x, y }, idx) => {
                if (Number.isFinite(x) && Number.isFinite(y)) {
                  context.lineTo(x, y);
                } else {
                  console.error(`Invalid coordinates for point ${idx}:`, x, y);
                }
              }
            );

            // Close path and stroke to draw the shape
            context.closePath();
            context.stroke();
          }
        }
      } else {
        console.error(`No coordinates found for image ID: ${currentImageId}.`);
      }

      // Add canvas to finalMasks array and display
      finalMasks.current.push(canvas);
    });
    console.log(finalMasks);
  };

  const showMask = () => {
    yap.current.innerHTML = "";
    // Get the canvas at the specified index
    const canvasToShow = finalMasks.current[currentIndexRef.current];

    if (!(canvasToShow instanceof HTMLCanvasElement)) {
      console.error("Expected a canvas element but got:", canvasToShow);
      return; // Exit the function if the element is not valid
    }
    // Append the selected canvas to the container
    yap.current.appendChild(canvasToShow);
    console.log("Showing mask of image id" + currentIndexRef.current);
  };

  const Summ = async () => {
    if (um.current == false) {
      handleMaskImages();
    } else {
    }
    setOpen(!open);
  };
  // Effect to load image when Dialog is open and `j` or `q1.current` changes
  useEffect(() => {
    const loadImage = async () => {
      if (q1.current) {
        cornerstone.enable(q1.current);
        console.log(imagesLOL.current[0]);
        console.log("j:", j);
        console.log("editedOnly length:", editedOnly.current.length);
        console.log("editedOnly[j]:", editedOnly.current[j]);

        try {
          let eww = await cornerstone.loadImage(
            `dicomfile:${editedOnly.current[j]}`
          );
          cornerstone.displayImage(q1.current, eww);
        } catch (error) {
          console.error("Error displaying image:", error);
        }
        q2.current.innerHTML = "";
        // Get the canvas at the specified index
        const canvasToShow = finalMasks.current[editedOnly.current[j]];
        if (!(canvasToShow instanceof HTMLCanvasElement)) {
          console.error("Expected a canvas element but got:", canvasToShow);
          return; // Exit the function if the element is not valid
        }
        // Append the selected canvas to the container
        q2.current.appendChild(canvasToShow);
      }
    };

    if (open) {
      loadImage(); // Load image if the Dialog is open
    }
  }, [open, j, q1.current]); // Depend on `open`, `j`, and `q1.current`

  // Toggle Zoom function
  const handleZoomToggle = () => {
    if (activeTool === "Zoom") {
      console.log("Disabling Zoom Tool");
      cornerstoneTools.setToolPassive("Zoom");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Zoom Tool");
      cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });
      setActiveTool("Zoom"); // Set active tool to Zoom
    }
  };

  // Toggle Pan function
  const handlePanToggle = () => {
    if (activeTool === "Pan") {
      console.log("Disabling Pan Tool");
      cornerstoneTools.setToolPassive("Pan");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Pan Tool");
      cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
      setActiveTool("Pan"); // Set active tool to Pan
    }
  };

  // Toggle Zoom function
  const handleLengthTool = () => {
    if (activeTool === "Length") {
      console.log("Disabling Length Tool");
      cornerstoneTools.setToolPassive("Length");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Zoom Tool");
      cornerstoneTools.setToolActive("Length", { mouseButtonMask: 1 });
      setActiveTool("Length"); // Set active tool to Zoom
    }
  }; //Toggle Length Tool

  const handleAngleTool = () => {
    if (activeTool === "Angle") {
      console.log("Disabling Angle Tool");
      cornerstoneTools.setToolPassive("Angle");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Angle Tool");
      cornerstoneTools.setToolActive("Angle", { mouseButtonMask: 1 });
      setActiveTool("Angle"); // Set active tool to Zoom
    }
  };

  const handleRectangleTool = () => {
    if (activeTool === "Rectangle") {
      console.log("Disabling Rectangle Tool");
      cornerstoneTools.setToolPassive("RectangleRoi");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Rectangle Tool");
      cornerstoneTools.setToolActive("RectangleRoi", { mouseButtonMask: 1 });
      setActiveTool("Rectangle"); // Set active tool to Zoom
      // initializeAnnotation(currentImageIndex, "RectangleRoi");
    }
  };

  const handleProbleTool = () => {
    if (activeTool === "Probe") {
      console.log("Disabling Probe Tool");
      cornerstoneTools.setToolPassive("Probe");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Probe Tool");
      cornerstoneTools.setToolActive("Probe", { mouseButtonMask: 1 });
      setActiveTool("Probe"); // Set active tool to Zoom
    }
  };

  const handleEraserTool = () => {
    if (activeTool === "Eraser") {
      console.log("Disabling Eraser Tool");
      cornerstoneTools.setToolPassive("Eraser");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Eraser Tool");
      cornerstoneTools.setToolActive("Eraser", { mouseButtonMask: 1 });
      setActiveTool("Eraser"); // Set active tool to Zoom
    }
  };

  const handleFHRTool = () => {
    if (activeTool === "FHR") {
      console.log("Disabling FHR Tool");
      cornerstoneTools.setToolPassive("FreehandRoi");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating FHR Tool");
      cornerstoneTools.setToolActive("FreehandRoi", { mouseButtonMask: 1 });
      setActiveTool("FHR"); // Set active tool to Zoom
    }
  };

  const handleEllipticalTool = () => {
    if (activeTool === "Ellipse") {
      console.log("Disabling Ellipse Tool");
      cornerstoneTools.setToolPassive("EllipticalRoi");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Ellipse Tool");
      cornerstoneTools.setToolActive("EllipticalRoi", { mouseButtonMask: 1 });
      setActiveTool("Ellipse"); // Set active tool to Zoom
    }
  };

  const handleMagnifyTool = () => {
    if (activeTool === "Magnify") {
      console.log("Disabling Magnify Tool");
      cornerstoneTools.setToolPassive("Magnify");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Magnify Tool");
      cornerstoneTools.setToolActive("Magnify", { mouseButtonMask: 1 });
      setActiveTool("Magnify"); // Set active tool to Zoom
    }
  };

  const handleRotateTool = () => {
    if (activeTool === "Rotate") {
      console.log("Disabling Rotate Tool");
      cornerstoneTools.setToolPassive("Rotate");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Rotate Tool");
      cornerstoneTools.setToolActive("Rotate", { mouseButtonMask: 1 });
      setActiveTool("Rotate"); // Set active tool to Zoom
    }
  };

  const handleShadeTool = () => {
    if (activeTool === "Shade") {
      console.log("Disabling Shade Tool");
      cornerstoneTools.setToolPassive("Wwwc");
      setActiveTool(""); // Clear active tool
    } else {
      console.log("Activating Shade Tool");
      cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
      setActiveTool("Shade"); // Set active tool to Zoom
    }
  };

  const saveAnnotations = async () => {
    try {
      console.log(imagesLOL.current);

      // Get the raw annotations
      const rawAnnotations = collectAllAnnotations(imagesLOL.current);

      // If it's already a string, parse it first
      const annotationsObj =
        typeof rawAnnotations === "string"
          ? JSON.parse(rawAnnotations)
          : rawAnnotations;

      // Convert to a properly formatted JSON object
      const cleanAnnotationsJSON = JSON.stringify(annotationsObj, null, 2);

      // If you need the object form for setJsonObj
      const annotationsAsObject = JSON.parse(cleanAnnotationsJSON);
      setJsonobj(annotationsAsObject);

      // Log to verify format
      console.log("Clean annotations:", annotationsAsObject);
      if (finalDirName) {
        finalDirName = dirname;
      }
    } catch (error) {
      console.error("Error in saveAnnotations:", error);
    }
  };

  const sendAnnos = async () => {
    if (!imagesLOL.current) {
      alert("Open a DICOM series and annotate!");
      return;
    }
    if (!finalDirName) {
      // Prevent setting the folder name state again if it's already being shown
      alert("Set the folder name!");
      return; // Prevent API calls without a folder name
    }
    console.log(finalDirName + "is set!");
    console.log(user.email);
    try {
      // Fetch folder contents
      const response = await axios.get(
        "http://localhost:8000/getFolderContents",
        {
          params: {
            email: user.email,
            folderName: finalDirName,
          },
        }
      );
      const files = response.data;

      console.log("jsonobj:", jsonobj); // Check if it's a valid object
      console.log("files:", files); // Ensure it's an array or expected file format #TODO files start from dicomImage:1
      console.log("finalDirName:", finalDirName); // Make sure it's not empty

      // Upload files to AI endpoint
      const uploadAIResponse = await axios.post(
        "http://localhost:8000/uploadAI",
        {
          email: user.email,
          selectedFolder: finalDirName,
          annotationsJSON: jsonobj, // Send clean object
          files,
        }
      );

      if (uploadAIResponse.status === 201) {
        console.log("Upload successful:", uploadAIResponse.data);

        // Delete the folder if upload is successful
        const deleteResponse = await axios.delete(
          "http://localhost:8000/deleteFolder",
          {
            data: { email: user.email, selectedFolder: finalDirName },
          }
        );

        if (deleteResponse.status === 200) {
          console.log("Folder deleted successfully:", deleteResponse.data);
          alert("Folder sent successfully! You can now leave this page.");
        }
      }
    } catch (error) {
      console.error("Error in sending Annotations:", error);
    }
  };

  const Next = () => {
    if (j + 1 < editedOnly.current.length) {
      setJ(j + 1);
      return true;
    }
    return false;
  };

  const Prev = () => {
    if (j - 1 >= 0) {
      setJ(j - 1);
      return true;
    }
    return false;
  };

  const lesgomask = () => {
    handleMaskImages();
    setTimeout(() => {
      showMask();
    }, 500);
  };

  // Handle directory name input
  const onChangeName = ({ target }) => setDirname(target.value);

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="bg-[#0A0A23] h-full w-full">
      <Button color="red" className="mt-4 ml-4 text-md" onClick={handleGoBack}>
        Back
      </Button>
      <div className="bg-[#0A0A23] h-full w-full flex justify-evenly text-center overflow-y-visible p-4 pt-10 gap-10">
        <div className="flex">
          <div
            className=" bg-black w-[1024px] h-[1024px] rounded-lg mx-auto"
            ref={viewerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {!imageLoaded && (
              <div className="flex justify-center items-center">
                <span className="text-white text-2xl my-auto mx-auto">
                  No image loaded yet
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="w-1/4 gap-2">
          <div className="relative flex w-full max-w-[24rem] mb-4 mx-auto">
            <Input
              type="text"
              variant="outlined"
              label="Folder Name"
              placeholder="Folder Name"
              value={dirname}
              onChange={onChangeName}
            />
            <Button
              size="sm"
              color={dirname ? "blue" : "gray"}
              disabled={!dirname}
              className="!absolute right-1 top-1 rounded"
              onClick={() => {
                finalDirName = dirname;
              }}
            >
              Confirm
            </Button>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button
              variant="gradient"
              className="flex items-center justify-center gap-3 relative w-full h-full"
              size="lg"
            >
              <label className="absolute inset-0 flex items-center justify-center gap-3 cursor-pointer">
                <input
                  onChange={handleFolderUpload} // Trigger Upload function
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
                <p className="text-md">Upload Folder</p>
              </label>
            </Button>
            <Button
              ripple={true}
              color="red"
              onClick={sendAnnos}
              className="text-md"
            >
              Send
            </Button>
          </div>
          <div className="my-4 grid grid-cols-4 gap-2">
            <Button
              ripple={true}
              color={isStackScrollEnabled ? "green" : "blue"}
              onClick={handleStackScrollToggle}
              size="sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Zoom" ? "green" : "blue"}
              onClick={handleZoomToggle}
              size="sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Pan" ? "green" : "blue"}
              onClick={handlePanToggle}
              size="sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
                {...props}
              >
                <path d="M18 11h-5V6h3l-4-4-4 4h3v5H6V8l-4 4 4 4v-3h5v5H8l4 4 4-4h-3v-5h5v3l4-4-4-4z" />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Length" ? "green" : "blue"}
              onClick={handleLengthTool}
              size="sm"
            >
              <svg
                viewBox="0 0 240 1000"
                fill="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
                {...props}
              >
                <path d="M168 688c48 22.667 72 60 72 112 0 33.333-11.667 61.667-35 85s-51.667 35-85 35-61.667-11.667-85-35-35-51.667-35-85c0-52 24-89.333 72-112V310C24 287.333 0 250.667 0 200c0-33.333 11.667-61.667 35-85s51.667-35 85-35 61.667 11.667 85 35 35 51.667 35 85c0 50.667-24 87.333-72 110v378M52 200c0 18.667 6.667 34.667 20 48 13.333 13.333 29.333 20 48 20s35-6.667 49-20 21-29.333 21-48c0-20-7-36.667-21-50-14-13.333-30.333-20-49-20s-34.667 6.667-48 20c-13.333 13.333-20 30-20 50m68 668c18.667 0 35-6.667 49-20s21-29.333 21-48c0-20-7-36.667-21-50-14-13.333-30.333-20-49-20s-34.667 6.667-48 20c-13.333 13.333-20 30-20 50 0 18.667 6.667 34.667 20 48 13.333 13.333 29.333 20 48 20" />
              </svg>
            </Button>
            {/* <Button
            ripple={true}
            color={activeTool === "Angle" ? "green" : "blue"}
            onClick={handleAngleTool}
            size="md"
          >
            <svg
              fill="none"
              viewBox="0 0 15 15"
              height="2em"
              width="2em"
              {...props}
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M8.891 2.194a.5.5 0 01.115.697L2.474 12H13.5a.5.5 0 010 1h-12a.5.5 0 01-.406-.791l7.1-9.9a.5.5 0 01.697-.115zM11.1 6.5a.5.5 0 111 0 .5.5 0 01-1 0zM10.4 4a.5.5 0 100 1 .5.5 0 000-1zm1.7 4.5a.5.5 0 111 0 .5.5 0 01-1 0zm1.3 1.5a.5.5 0 100 1 .5.5 0 000-1z"
                clipRule="evenodd"
              />
            </svg>
          </Button> */}
            <Button
              ripple={true}
              color={activeTool === "Probe" ? "green" : "blue"}
              onClick={handleProbleTool}
              size="sm"
            >
              <svg
                name="dot-circle"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="mx-auto"
                height="3em"
                width="3em"
                fill="cyan"
              >
                <title>Dot Circle</title>
                <path d="M256 56c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m0-48C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 168c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z"></path>
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Rectangle" ? "green" : "blue"}
              onClick={handleRectangleTool}
              size="sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
                {...props}
              >
                <title>Rectangle</title>
                <path d="M4 6v13h16V6H4m14 11H6V8h12v9z" />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Eraser" ? "green" : "blue"}
              onClick={handleEraserTool}
              size="sm"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 16 16"
                className="mx-auto"
                height="3em"
                width="3em"
                {...props}
              >
                <path d="M8.086 2.207a2 2 0 012.828 0l3.879 3.879a2 2 0 010 2.828l-5.5 5.5A2 2 0 017.879 15H5.12a2 2 0 01-1.414-.586l-2.5-2.5a2 2 0 010-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 000 1.414l2.5 2.5a1 1 0 00.707.293H7.88a1 1 0 00.707-.293l.16-.16z" />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "FHR" ? "green" : "blue"}
              onClick={handleFHRTool}
              size="sm"
            >
              <svg
                fill="none"
                viewBox="0 0 15 15"
                className="mx-auto"
                height="3em"
                width="3em"
                {...props}
              >
                <path
                  stroke="currentColor"
                  d="M1.5 5C3 2 7.3.5 6.5 2.5 5.5 5-.5 9.5 3 11c1.343.576 3.055.45 4.654-.05m0 0C10.222 10.145 12.5 8.377 12.5 7 12.5 4.5 9 5.5 8 9c-.206.722-.328 1.381-.346 1.95zm0 0C7.584 13.133 9.032 13.983 13 12"
                />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Ellipse" ? "green" : "blue"}
              onClick={handleEllipticalTool}
              size="sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
                {...props}
              >
                <path d="M12 6c4.41 0 8 2.69 8 6s-3.59 6-8 6-8-2.69-8-6 3.59-6 8-6m0-2C6.5 4 2 7.58 2 12s4.5 8 10 8 10-3.58 10-8-4.5-8-10-8z" />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Magnify" ? "green" : "blue"}
              onClick={handleMagnifyTool}
              size="sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </Button>

            <Button
              ripple={true}
              color={activeTool === "Rotate" ? "green" : "blue"}
              onClick={handleRotateTool}
              size="sm"
            >
              <svg
                viewBox="0 0 512 512"
                fill="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
                {...props}
              >
                <path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2S334.3 224 344 224h128c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2S461.9 48.1 455 55l-41.6 41.6c-87.6-86.5-228.7-86.2-315.8 1-24.4 24.4-42 53.1-52.8 83.8-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v128c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1 24.4-24.4 42.1-53.1 52.9-83.7 5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2S177.7 288 168 288H40c-13.3 0-24 10.7-24 24z" />
              </svg>
            </Button>
            <Button
              ripple={true}
              color={activeTool === "Shade" ? "green" : "blue"}
              onClick={handleShadeTool}
              size="sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mx-auto"
                height="3em"
                width="3em"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              ripple={true}
              color="purple"
              onClick={saveAnnotations}
              id="theButton"
              className="text-sm"
            >
              Save Annotations
            </Button>
            <Button
              ripple={true}
              color="purple"
              onClick={lesgomask}
              id="theButton"
              className="text-sm"
            >
              Show Mask Images
            </Button>
            <Button
              ripple={true}
              color="purple"
              onClick={Summ}
              className="text-sm"
            >
              Summarise Masks
            </Button>
            <Dialog
              open={open}
              handler={Summ}
              className="flex flex-col"
              size="xl"
            >
              <DialogHeader className="mx-auto">Summarised Masks</DialogHeader>
              <DialogBody className="gap-5 flex flex-col mx-auto bg-blue-gray-400">
                <div className="flex">
                  <div
                    ref={q1}
                    className="m-4 bg-black w-[512px] h-[512px] rounded-lg"
                  ></div>
                  <div
                    ref={q2}
                    className="m-4 bg-black w-[512px] h-[512px] rounded-lg"
                  ></div>
                </div>
                <div className="flex justify-evenly">
                  <Button size="lg" className="w-40" onClick={Prev}>
                    Previous
                  </Button>
                  <h2 className="text-black text-lg">
                    {" "}
                    {editedOnly.current[j]}th Image{" "}
                  </h2>
                  <Button size="lg" className="w-40" onClick={Next}>
                    Next
                  </Button>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="text"
                  color="red"
                  onClick={handleOpen}
                  className="mr-1"
                >
                  <span>Cancel</span>
                </Button>
                <Button variant="gradient" color="green" onClick={handleOpen}>
                  <span>Confirm</span>
                </Button>
              </DialogFooter>
            </Dialog>
            <div className="mt-20 flex flex-col">
              <h1 className="text-white text-xl mb-4 mx-auto">Mask image</h1>
              <div
                className=" bg-black w-[512px] h-[512px] rounded-lg flex justify-center items-center"
                ref={yap}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dcmvi;
