const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  docId: String,
  folderName: String,
  uploadedAt: { type: Date, default: Date.now },
});
// Create the Folder model
const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
