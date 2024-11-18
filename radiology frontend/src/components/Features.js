import React from "react";
import { FaCode, FaEye, FaTachometerAlt, FaUser } from "react-icons/fa"; // React Icons

const Features = () => {
  return (
    <div className="features">
      <div className="bg-[#0A0A23] py-16 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center text-center">
        {/* Features Heading */}
        <h1 className="text-[#60CFFF] text-5xl font-extrabold mb-8">
          Features
        </h1>

        <section className="w-full flex flex-col items-center justify-center">
          {/* Small Intro Paragraph */}
          <p className="text-gray-400 text-lg mb-8 max-w-3xl">
            Radiology v2.0 is designed to deliver a high-performance, web-based
            imaging solution for radiologists. With advanced visualization tools
            and GPU-accelerated performance, you can review cases quickly and
            efficiently. It is a centralized platform which performs complete
            diagnostic workflow Annotation → Prediction → Visualization.
          </p>

          {/* Main Features Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start lg:text-left space-y-8 lg:space-y-0">
            {/* Left Side - Image */}
            <div className="w-full lg:w-1/2 flex justify-center mt-2">
              <img
                src="https://www.shutterstock.com/image-photo/film-xray-radiograph-thumb-associated-600nw-2408414483.jpg" // Replace with the correct image path
                alt="Advanced Imaging"
                className="rounded-lg shadow-lg h-96"
              />
            </div>

            {/* Right Side - Features List */}
            <div className="w-full lg:w-1/2 space-y-6">
              <h2 className="text-[#60CFFF] text-3xl font-bold mb-4">
                Performance-focused web app
              </h2>

              <div className="flex items-start space-x-4">
                <FaEye className="text-[#60CFFF] text-2xl" />
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Advanced visualization
                  </h3>
                  <p className="text-gray-400">
                    See all the details with support for multi-modal image
                    fusion, multi-planar reformatting, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FaTachometerAlt className="text-[#60CFFF] text-2xl" />
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    High-performance
                  </h3>
                  <p className="text-gray-400">
                    Speed up your work with GPU accelerated image rendering and
                    multi-threaded image decoding.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FaCode className="text-[#60CFFF] text-2xl" />
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Web application
                  </h3>
                  <p className="text-gray-400">
                    Load cases from anywhere, instantly, with no installation
                    required. Supports all modern browsers.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FaUser className="text-[#60CFFF] text-2xl" />
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    User-centered design
                  </h3>
                  <p className="text-gray-400">
                    Professional product and interaction design with a focus on
                    usability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Features;
