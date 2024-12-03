import { Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';

import './App.css';
import Custom_Viewport from './components/Custom_Viewport';
import { Home3D, Home2D, About, Credits } from './pages/index.js';
import AlbumDetail from './pages/AlbumDetail';

function App() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  return (
    <main className="w-screen h-screen relative">
      {/* Hide navbar on Home3D page */}
      {location.pathname !== '/Home3D' && <Custom_Viewport />}
      <Routes>
        <Route path="/" element={<Home2D />} /> {/* Landing page */}
        <Route path="/Home3D" element={<Home3D />} />
        <Route path="/Credits" element={<Credits />} />
        <Route path="/About" element={<About />} />
        <Route path="/album/:albumId" element={<AlbumDetail />} />
      </Routes>
    </main>
  );
}

export default App;
