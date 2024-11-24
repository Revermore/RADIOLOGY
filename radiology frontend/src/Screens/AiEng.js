import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

const AiEng = (props) => {
  const TABLE_HEAD = ["Doctor Name", "Folder Name", ""]; // Table headers

  const [folders, setFolders] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        // Fetch outer folders (doctor emails)
        const response = await axios.get("http://localhost:8000/getAIFolders");
        const folderEmails = response.data.folders; // Array of emails from the folders
        setFolders(folderEmails);

        if (folderEmails && folderEmails.length > 0) {
          await fetchDoctorInfo(folderEmails); // Fetch corresponding doctor info
        }
      } catch (err) {
        console.error("Error fetching folders:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDoctorInfo = async (emails) => {
      const doctorData = [];
      for (let email of emails) {
        try {
          // Fetch doctor info
          const doctorResponse = await axios.get(
            `http://localhost:5000/auth/doctor/${email}`
          );
          const doctor = doctorResponse.data;

          // Fetch subfolders for each doctor
          const subfoldersResponse = await axios.get(
            `http://localhost:8000/getSubFolders/${email}`
          );
          const subfolders = subfoldersResponse.data.subfolders;

          // Add doctor info along with subfolder names
          subfolders.forEach((subfolder) => {
            doctorData.push({
              name: doctor.name,
              email: doctor.email,
              subfolder,
            });
          });
        } catch (err) {
          console.error(`Error fetching info for ${email}:`, err);
        }
      }
      setDoctorInfo(doctorData); // Store the full list of doctor-subfolder data
    };

    fetchFolders();
  }, []);

  const handleDownload = async (email, subfolderName) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const encodedSubfolderName = encodeURIComponent(subfolderName);
      console.log("Downloading folder:", subfolderName, "for email:", email);
      console.log("Encoded email:", encodedEmail);
      console.log("Encoded subfolder name:", encodedSubfolderName);

      const response = await axios.get(
        `http://localhost:8000/downloadFolder/${encodedEmail}/${encodedSubfolderName}`,
        {
          responseType: "blob",
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          },
        }
      );

      if (!(response.data instanceof Blob)) {
        throw new Error("Response is not a blob");
      }

      // Trigger the file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${subfolderName}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      if (error.response) {
        const errorMessage =
          error.response.data instanceof Blob
            ? "Server error"
            : error.response.data.message || "Unknown server error";
        alert(`Download failed: ${errorMessage}`);
      } else if (error.request) {
        alert("No response from server. Please check your connection.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-[#0A0A23] h-screen flex flex-col">
      <h1 className="text-white text-5xl mt-20 text-center">A.I Engineer</h1>
      <div className="flex flex-col items-center w-screen mt-10">
        <h1 className="text-2xl text-white">Doctor Details</h1>
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
            {doctorInfo.map(({ name, subfolder, email }, index) => {
              const isLast = index === doctorInfo.length - 1;
              const classes = isLast
                ? "p-4"
                : "p-4 border-b border-blue-gray-50";

              return (
                <tr key={email + subfolder}>
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
                      {subfolder}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Button
                      variant="gradient"
                      className="flex items-center gap-3"
                      size="sm"
                      onClick={() => handleDownload(email, subfolder)}
                    >
                      <svg
                        viewBox="0 0 1024 1024"
                        fill="currentColor"
                        height="2em"
                        width="2em"
                        {...props}
                      >
                        <path d="M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AiEng;
