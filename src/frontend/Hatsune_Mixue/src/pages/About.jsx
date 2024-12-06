import React from 'react';
import { useNavigate } from 'react-router-dom';
import HillBackground from '../models/HillBackground.jsx';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8 pt-16 relative">
      <HillBackground />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-white-500 hover:underline z-10"
      >
        &larr; Back
      </button>

      <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">About</h1> {/* Ini kenapa gak mau ganti warnaaaaaa*/}
      <p className="max-w-2xl text-center text-black dark:text-white"> {/* ini jugaaaa*/}
        Hatsune Mixue is an application designed to recognize album pictures and audio...
      </p>
    </div>
  );
};

export default About;
