import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    } else {
      // Make sure that dark-mode/light-mode persist (at least I try to, tapi gabisa cok wutdehel)
      const isCurrentlyDark = document.body.classList.contains('dark-mode' || 'dark');
      setIsDarkMode(isCurrentlyDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode', !isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  return ( //The switch
    <div className="relative top-4 left-4 z-10 flex items-center">
      <span className="mr-2 text-sm">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
      <label className="relative inline-block w-10 h-5">
        <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className="opacity-0 w-0 h-0" />
        <span className="slider round block cursor-pointer bg-gray-300 absolute inset-0 transition duration-200 ease-in-out before:bg-white before:content-[''] before:absolute before:h-4 before:w-4 before:left-1 before:bottom-0.5 before:transition-transform before:duration-200"
          style={{
            borderRadius: '9999px', //idk man, just a big number wkwkwk
          }}
        ></span>
      </label>
    </div>
  );
};

export default ThemeToggle;
