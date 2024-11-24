const mongoose = require("mongoose");

// Define the Request Schema for DICOM images
const requestSchema = new mongoose.Schema({
  docId: { type: Number, required: true }, // Doctor ID that the folder will be sent to
  folderName: { type: String, required: true }, // Folder name for the DICOM images
  dicomImages: [
    {
      filename: { type: String, required: true }, // Original filename
      contentType: { type: String, required: true }, // MIME type of the file
      data: { type: Buffer, required: true }, // DICOM image data stored as Buffer
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Timestamp when the request is created
});

// Create the Request model
const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
