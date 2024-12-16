// MY WIIIIIIIIIIFFFFFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
import React, { useEffect } from 'react';
import HillBackground from '../models/HillBackground.jsx';
import { applyTheme } from '../components/CheckTheme.jsx';

const HeartPage = () => {
  useEffect(() => {
    const createHearts = () => {
      const container = document.querySelector('.heart-container');
      if (container) {
        const heart = document.createElement('div');
        heart.className = 'heart';

        const variants = ['❤️', '💖', '💗', '💓', '💞', '💕', '❣️', '💘'];
        heart.textContent = variants[Math.floor(Math.random() * variants.length)];
        heart.style.left = `${Math.random() * 100}%`;

        container.appendChild(heart);

        setTimeout(() => {
          heart.remove();
        }, 5000);
        applyTheme();
      }
    };

    const interval = setInterval(createHearts, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <HillBackground />
      <div className="heart-container absolute inset-0"></div>
      <img
        src="/My_Wife.jpg"
        alt="Central Image"
        className="z-10 w-48 h-48 rounded-full"
      />
      <button
        onClick={() => window.close()}
        className="absolute bottom-10 bg-gray-300 text-black py-2 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-400 transition transform hover:scale-105"
      >
        Close Page
      </button>
    </div>
  );
};

export default HeartPage;
