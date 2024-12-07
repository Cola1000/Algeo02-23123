import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HillBackground from '../models/HillBackground.jsx';
import { applyTheme } from '../components/CheckTheme.jsx'

const Credits = () => {
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(); // Check and apply the theme on page load
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8 relative">
      <HillBackground />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-white-500 hover:underline z-10"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Credits</h1>
      <p className="max-w-2xl text-center text-black dark:text-white">
        This project was developed by [Your Mom]. Special thanks to all contributors...
      </p>
    </div>
  );
};

export default Credits;
