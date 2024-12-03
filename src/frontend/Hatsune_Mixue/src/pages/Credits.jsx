import React from 'react';
import { useNavigate } from 'react-router-dom';

const Credits = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-blue-500 hover:underline"
      >
        &larr; Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Credits</h1>
      <p className="max-w-2xl text-center">
        This project was developed by [Your Mom]. Special thanks to all contributors and open-source libraries that made this project possible.
      </p>
      {/* Add more detailed credits as needed */}
    </div>
  );
};

export default Credits;