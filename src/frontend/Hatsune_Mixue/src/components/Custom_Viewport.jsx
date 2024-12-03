import React, { useState } from 'react';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Custom_Viewport = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0  z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
        <button
          onClick={() => navigate('/Home3D')}
          className="w-10 h-10 rounded-lg items-center justify-center flex font-bold shadow-md bg-black-500"
        >
          <p className="blue-gradient_text">3D</p>
        </button>
          <div className="flex space-x-4">
            <Link to="/About" className="text-white-800 hover:text-blue-500">
              About
            </Link>
            <Link to="/Credits" className="text-white-800 hover:text-blue-500">
              Credits
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Custom_Viewport;