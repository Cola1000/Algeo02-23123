import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HillBackground from '../models/HillBackground.jsx';
import { applyTheme } from '../components/CheckTheme.jsx';

const creditsData = [
  {
    section: "Developers",
    items: [
      { name: "13523123 - Rhio Bimo P S - (Cola 1000)", link: "https://github.com/Cola1000" },
      { name: "13523146 - Rafael Marchell D W - (V-Kleio)", link: "https://github.com/V-Kleio" },
      { name: "13523160 - I Made Wiweka P - (wiwekaputra)", link: "https://github.com/wiwekaputera" },
      { name: "My Wife ❤️", link: "./My_Wife" },
    ],
  },
  {
    section: "Resources and Tools",
    items: [
      { name: "Our Repository", link: "https://github.com/Cola1000/HatsuneMix-ue-" },
      { name: "Vite", link: "https://vite.dev" },
      { name: "Github GLTF to React", link: "https://gltf.pmnd.rs" },
      { name: "3D Hill Model Inspiration (rockdanister)", link: "https://github.com/rocksdanister/lively" },
      { name: "JavaScript Mastery 3D Website Tutorial", link: "https://youtu.be/FkowOdMjvYo?si=13ccbqc_fKwn5yTy" },
    ],
  },
];

const Credits = () => {
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(); // Check and apply the theme on page load
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-8"
      style={{
        color: 'var(--text-color)', // Dynamically set the text color based on the theme
      }}
    >
      <HillBackground />

      {/* Content */}
      <section className="z-10 max-w-4xl text-center bg-opacity-80 p-6 rounded-lg">
        <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
          Credits
        </h1>
        <p className="text-lg mb-8">
          This project was made possible thanks to the contributions and inspirations from the following people and resources. Scroll down to explore the list!
        </p>

        {/* Scrollable Credits Section */}
        <div className="max-h-96 overflow-y-auto rounded-lg p-4 shadow-md">
          {creditsData.map((section, index) => (
            <div key={index} className="mb-6">
              <h2 className="text-xl font-bold mb-4">{section.section}</h2>
              <ul>
                {section.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex justify-between items-center mb-2 border-b pb-3"
                  >
                    <span>{item.name}</span>
                    <button
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-1 px-4 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
                      onClick={() => window.open(item.link, '_blank')}
                    >
                      Visit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-10">
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

export default Credits;
