// src/App.jsx
import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import './App.css';
import Custom_Viewport from './components/Custom_Viewport';
import { Home3D, Home2D, About, Credits, Info3DPage } from './pages/index.js';
import AlbumDetail from './pages/AlbumDetail';
import AudioRecorder from './pages/AudioRecorder.jsx';
import HeartPage from './pages/My_Wife.jsx';

function App() {
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  return (
    <main className="w-screen h-screen relative">
      {location.pathname !== '/Home3D' && location.pathname !== '/Info3DPage' && <Custom_Viewport />}

      <Routes>
        <Route path="/" element={<Home2D />} />
        <Route path="/Home3D" element={<Home3D />} />
        <Route path="/Credits" element={<Credits />} />
        <Route path="/About" element={<About />} />
        <Route path="/album/:albumId" element={<AlbumDetail />} />
        <Route path="/audio-recorder" element={<AudioRecorder />} />
        <Route path="/My_Wife" element={<HeartPage />} />
        <Route path="/Info3DPage" element={<Info3DPage />} />
      </Routes>
    </main>
  );
}

export default App;
