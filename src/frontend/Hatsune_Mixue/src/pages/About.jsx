import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HillBackground from '../models/HillBackground.jsx';
import { applyTheme } from '../components/CheckTheme.jsx';

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(); // Check and apply the theme on page load
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-8"
      style={{
        color: 'var(--text-color)',
      }}
    >
      <HillBackground />

      {/* Content */}
      <section className="z-10 max-w-4xl text-center bg-opacity-80 p-6 rounded-lg">
        <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
          About
        </h1>
        <p className="text-lg mb-8">
          Welcome to{' '}
          <span className="blue-gradient_text font-bold">
            Hatsune Mixue
          </span>
          ! This project was created to fulfill one of our college assignment requirements. The assignment was to develop a music recognition system inspired by the concept of <span className="font-semibold italic">Shazam</span>. However, we decided to add our own creative twist to make it unique! 🎶✨
        </p>
        <p className="text-lg mb-8">
          This website stems from a simple idea: <span className="italic">"I want to create a connection with anime and make it 3D."</span> We decided to infuse the entire website with an anime-inspired theme. The hill background you see is actually in 3D! And yes, we even have an entire page dedicated to 3D elements. Dive in and enjoy the experience!
        </p>
        <p className="text-lg mb-5">
          You can also watch our video about this project below! <span className="text-2xl">◕‿↼</span>
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
            onClick={() => window.open('https://youtu.be/tBEwePViKrs', '_blank')}
          >
            Watch Video
          </button>
          <button
            className="bg-gray-300 text-black py-2 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-400 transition transform hover:scale-105"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
