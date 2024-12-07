import React, { useState, useEffect } from 'react';
import { Html, useProgress } from '@react-three/drei';

const CoolLoader = () => {
  const { progress } = useProgress();
  const [currentImage, setCurrentImage] = useState(() => Math.floor(Math.random() * 3));

  const images = [
    "/Rhio_Algeo_Square.png",
    "/Weka_Image_Square.png",
    "/Rafael_Lanjar_Square.png",
  ];

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 250); //Interval ganti picture

    return () => clearInterval(imageInterval);
  }, [images.length]);

  return (
    <Html center>
      <div className="flex flex-col items-center space-y-4">
        {/* Glowing Spinner with Image */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 animate-spin-slow"></div>
          <div className="absolute inset-1 rounded-full overflow-hidden">
            <img
              src={images[currentImage]}
              alt="Loading Image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-48 bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-white text-lg font-semibold tracking-wide">
          Loading 3D Environment... {Math.floor(progress)}%
        </p>
      </div>

      {/* Custom CSS yang aku gaakan masukin index css wkwkwkwk */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Html>
  );
};

export default CoolLoader;
