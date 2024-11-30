import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Custom_Viewport() {
  const [is3D, setIs3D] = useState(true); // State to toggle between 3D and 2D
  const navigate = useNavigate();

  const handleToggle = () => {
    setIs3D((prev) => !prev); // Toggle the state
    navigate(is3D ? '/Home2D' : '/');
  };

  return (
    <div>
      <header className="header flex text-lg">
        <button
          onClick={handleToggle} // Handle the toggle and navigation on click
          className="w-10 h-10 rounded-lg items-center justify-center flex font-bold shadow-md bg-black-500"
        >
          <p className="blue-gradient_text">{is3D ? '3D' : '2D'}</p>
        </button>
        <nav className="flex text-lg gap-7 font-medium">
          <NavLink
            to="/Credits"
            className={({ isActive }) =>
              isActive ? 'text-blue-500' : 'text-white'
            }
          >
            Credits
          </NavLink>
          <NavLink
            to="/About"
            className={({ isActive }) =>
              isActive ? 'text-blue-500' : 'text-white'
            }
          >
            About
          </NavLink>
        </nav>
      </header>
    </div>
  );
}

export default Custom_Viewport;
