// About.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8 pt-16 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-blue-500 hover:underline"
      >
        &larr; Back
      </button>

      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p className="max-w-2xl text-center">
        Hatsune Mixue is an application designed to recognize album pictures and audio. It provides users with the ability to explore albums, listen to songs, and download content for personal use.
      </p>
      {/* Add more detailed information about the project */}
    </div>
  );
};

export default About;
