// utils/dicomUtils.js
export async function loadDicomFile(fileUrl) {
  try {
    const response = await fetch(fileUrl);

    if (!response.ok)
      throw new Error(`Failed to fetch file. Status: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    console.error("Error loading file:", err.message);
    throw err;
  }
}

export async function checkDicomHeader(fileUrl) {
  const fileBytes = await loadDicomFile(fileUrl);

  if (!fileBytes) throw new Error("Failed to load file for header check.");

  console.log("First 140 bytes:", fileBytes.slice(0, 140));
  const prefix = String.fromCharCode(...fileBytes.slice(128, 132));
  if (prefix === "DICM") {
    console.log("Valid DICOM file! Found 'DICM' at the correct location.");
    return true;
  } else {
    console.error("DICM prefix not found at the correct location.");
    return false;
  }
}
