const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");
const app = express();
const PORT = 5000;
const Folder = require("./Models/folder");
const gridfsStream = require("gridfs-stream");
const multer = require("multer");

// Middleware to parse JSON and handle CORS
const upload = multer(); // Without diskStorage to handle files in memory
app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);
// MongoDB connection
const dbURI =
  "mongodb+srv://pguruprasad204:zZLSFq0TRwcdfoFf@dccluster.cbfty.mongodb.net/"; // Put your MongoDB Atlas connection string here

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("Failed to connect to MongoDB:", err));

const connection = mongoose.connection;
let gfs;
connection.once("open", () => {
  gfs = gridfsStream(connection.db, mongoose.mongo);
  gfs.collection("dicomFiles");
});
// Example route

app.get("/api/status", (req, res) => {
  res.json({
    mongoConnected: mongoose.connection.readyState === 1,
    gfsInitialized: !!gfs,
  });
});

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.post(
  "/auth/uploadDicomFolder",
  upload.array("dicomImages"),
  async (req, res) => {
    console.log("Received upload request");
    console.log("Files count:", req.files?.length);
    console.log("Body:", req.body);

    const { docId, folderName } = req.body;

    if (!docId || !folderName || !req.files || req.files.length === 0) {
      console.error("Missing required data:", {
        docId,
        folderName,
        filesCount: req.files?.length,
      });
      return res
        .status(400)
        .json({ message: "Invalid request. Missing data." });
    }

    try {
      const folder = new Folder({ docId, folderName });
      await folder.save();
      console.log("Created folder:", folder);

      const bucket = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "dicomFiles",
      });

      let orderIndex = 0;
      for (const file of req.files) {
        console.log("Processing file:", file.originalname);
        console.log("File buffer size:", file.buffer.length);

        // Verify DICOM header before upload
        const dicomData = new Uint8Array(file.buffer);
        const prefix = String.fromCharCode(...dicomData.slice(128, 132));
        console.log("DICOM prefix:", prefix);

        const uploadStream = bucket.openUploadStream(file.originalname, {
          contentType: "application/dicom",
          metadata: {
            docId,
            folderName,
            orderIndex: orderIndex++,
            uploadedAt: new Date(),
            originalName: file.originalname,
            fileSize: file.size,
          },
        });

        await new Promise((resolve, reject) => {
          uploadStream.end(file.buffer, (err) => {
            if (err) {
              console.error(`Error uploading ${file.originalname}:`, err);
              reject(err);
            } else {
              console.log(`Successfully uploaded ${file.originalname}`);
              resolve();
            }
          });
        });
      }

      res.status(201).json({ message: "DICOM folder uploaded successfully!" });
    } catch (error) {
      console.error("Error uploading DICOM folder:", error);
      res.status(500).json({
        message: "Server error. Could not upload folder.",
        error: error.message,
      });
    }
  }
);

app.get("/auth/getFoldersByDocId/:docId", async (req, res) => {
  const { docId } = req.params;
  console.log("Fetching folders for docId:", docId);

  try {
    if (!gfs) {
      console.error("GridFS not initialized");
      return res.status(500).json({ message: "GridFS is not initialized!" });
    }

    const folders = await Folder.find({ docId });
    console.log("Found folders:", folders.length);

    if (folders.length === 0) {
      return res
        .status(404)
        .json({ message: "No folders found for this doctor." });
    }

    const folderDetails = [];

    for (const folder of folders) {
      const { folderName, _id } = folder;
      console.log("Processing folder:", folderName);

      const files = await gfs.files
        .find({ "metadata.folderName": folderName })
        .sort({ "metadata.orderIndex": 1 })
        .toArray();

      console.log(`Found ${files.length} files in folder ${folderName}`);

      const fileData = files.map((file) => ({
        filename: file.filename,
        id: file._id.toString(),
        size: file.length,
        uploadDate: file.uploadDate,
      }));

      folderDetails.push({
        folderName,
        docId,
        uploadedAt: folder.uploadedAt,
        files: fileData,
      });
    }

    console.log("Sending folder details:", folderDetails);
    res.status(200).json(folderDetails);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.get("/auth/getDicomFile/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received request for file ID:", id);

  try {
    if (!gfs) {
      console.error("GridFS not initialized");
      return res.status(500).json({ message: "GridFS is not initialized!" });
    }

    let _id;
    try {
      _id = new mongoose.Types.ObjectId(id);
      console.log("Converted to ObjectId:", _id);
    } catch (error) {
      console.error("Invalid ObjectId:", id);
      return res.status(400).json({ message: "Invalid file ID format" });
    }

    const file = await gfs.files.findOne({ _id });
    console.log("Found file:", file ? "yes" : "no");

    if (!file) {
      console.error("File not found for ID:", id);
      return res.status(404).json({ message: "File not found!" });
    }

    console.log("File details:", {
      filename: file.filename,
      size: file.length,
      contentType: file.contentType,
    });

    res.set({
      "Content-Type": "application/dicom",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Accept-Ranges": "bytes",
      "Content-Length": file.length,
      "Access-Control-Allow-Origin": "http://localhost:3000", // Add your frontend URL
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    });

    const readStream = gfs.openDownloadStream(_id);

    // Add error handling for the stream
    readStream.on("error", (error) => {
      console.error("Stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming file" });
      }
    });

    // Add event listener for when the stream ends
    readStream.on("end", () => {
      console.log("Successfully streamed file:", file.filename);
    });

    readStream.pipe(res);
  } catch (error) {
    console.error("Detailed error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Server Error",
        error: error.message,
        stack: error.stack,
      });
    }
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
