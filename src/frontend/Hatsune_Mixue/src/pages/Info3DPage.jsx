// src/pages/Info3DPage.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { PerspectiveCamera, Html } from "@react-three/drei";
import { Physics, usePlane } from "@react-three/cannon";
import MovementController from "../components/MovementController.jsx";
import { useNavigate } from 'react-router-dom';
import { applyTheme } from '../components/CheckTheme.jsx';
import * as THREE from 'three';
import AboutContent from './About.jsx';   // We'll embed About content without back button
import CreditsContent from './Credits.jsx'; // We'll embed Credits without back button
// We must create custom components that show about and credits inside a 3D plane
// without their back buttons. We'll replicate their HTML inside this file directly.

// Since we cannot easily re-use About and Credits as is (they have back buttons, etc.),
// we can copy their content here in a simpler form and remove back buttons.

function GroundPlane() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0,0,0]
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial color="#888" />
    </mesh>
  );
}

// A rotating cube in the sky
function SkyCube() {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.1;
      ref.current.rotation.y += delta * 0.1;
    }
  });
  return (
    <mesh ref={ref} position={[0,50,-50]}>
      <boxGeometry args={[5,5,5]} />
      <meshStandardMaterial color="purple" />
    </mesh>
  );
}

function ThemedEnvironment({ isDarkMode }) {
  // We can change the scene background or add a hemisphere light differently based on isDarkMode.
  const { scene } = useThree();

  useEffect(() => {
    if (isDarkMode) {
      // Dark mode: evening
      scene.background = new THREE.Color(0x0a0a28);
      // maybe add some subtle light
    } else {
      // Light mode: dawn
      scene.background = new THREE.Color(0xffeedd);
    }
  }, [isDarkMode, scene]);

  return null;
}

// We'll create simple HTML UI using drei <Html> for About and Credits.

// About Panel (no back button)
function AboutPanel() {
  return (
    <div style={{ color: 'var(--text-color)', width: '300px', maxHeight: '400px', overflow: 'auto', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius:'10px'}}>
      <h1 style={{ fontSize:'24px', fontWeight:'bold', marginBottom:'10px'}}>About</h1>
      <p style={{ marginBottom:'10px'}}>
        Welcome to <span style={{fontWeight:'bold'}}>Hatsune Mixue</span>! This project was created ...
      </p>
      <p style={{ marginBottom:'10px'}}>
        We decided to infuse the entire website with an anime-inspired theme...
      </p>
      <p style={{ marginBottom:'10px'}}>
        You can also watch our video about this project below! ◕‿↼
      </p>
      <button
        style={{background:'linear-gradient(to right, #00c6ff, #0072ff)', color:'#fff', padding:'10px', border:'none', borderRadius:'5px', cursor:'pointer'}}
        onClick={() => window.open('https://youtu.be/tBEwePViKrs', '_blank')}
      >
        Watch Video
      </button>
    </div>
  );
}

// Credits Panel (no back button)
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
      { name: "3D Hill Model Inspiration (yoichi kobayashi)", link: "https://codepen.io/ykob" },
      { name: "JavaScript Mastery 3D Website Tutorial", link: "https://youtu.be/FkowOdMjvYo?si=13ccbqc_fKwn5yTy" },
      { name: "Audio Visualizer @ React", link: "https://dev.to/ssk14/visualizing-audio-as-a-waveform-in-react-o67" },
    ],
  },
];

function CreditsPanel() {
  return (
    <div style={{color:'var(--text-color)', width:'300px', maxHeight:'400px', overflow:'auto', background:'rgba(0,0,0,0.5)', padding:'10px', borderRadius:'10px'}}>
      <h1 style={{fontSize:'24px', fontWeight:'bold', marginBottom:'10px'}}>Credits</h1>
      {creditsData.map((section,index)=>(
        <div key={index} style={{marginBottom:'20px'}}>
          <h2 style={{fontSize:'18px', fontWeight:'bold', marginBottom:'10px'}}>{section.section}</h2>
          <ul style={{listStyle:'none', padding:'0'}}>
            {section.items.map((item, iIndex) => (
              <li key={iIndex} style={{marginBottom:'10px', borderBottom:'1px solid #fff', paddingBottom:'5px', display:'flex', justifyContent:'space-between'}}>
                <span>{item.name}</span>
                <button
                  style={{background:'linear-gradient(to right, #00c6ff, #0072ff)', color:'#fff', padding:'5px', border:'none', borderRadius:'5px', cursor:'pointer'}}
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
  );
}

// Interactive Panels as 3D Objects
function InteractivePanel({ position, content }) {
  return (
    <mesh position={position}>
      <planeGeometry args={[3,3]} />
      <meshBasicMaterial color="white" transparent opacity={0} />
      <Html center transform distanceFactor={5}>
        {content}
      </Html>
    </mesh>
  );
}

// A return button in front
function ReturnButton({ onClick }) {
  return (
    <mesh position={[0,1,-5]}>
      <planeGeometry args={[1,0.5]} />
      <meshBasicMaterial color="white" transparent opacity={0}/>
      <Html center transform distanceFactor={5}>
        <button
          style={{background:'linear-gradient(to right, #00c6ff, #0072ff)', color:'#fff', padding:'10px', border:'none', borderRadius:'5px', cursor:'pointer'}}
          onClick={onClick}
        >
          Back to Home3D
        </button>
      </Html>
    </mesh>
  );
}

// Crosshair
function Crosshair() {
  const size = 0.01; 
  return (
    <mesh position={[0,0,-1]}>
      <ringGeometry args={[size, size+0.001, 32]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}

const Info3DPage = () => {
  const navigate = useNavigate();
  const cameraRef = useRef();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  useEffect(() => {
    applyTheme();
    const handleKeyDown = (e) => {
      if (e.code === "Escape") {
        document.exitPointerLock();
        navigate('/Home3D');
      }
      if (e.key === '/') {
        // Toggle theme
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
        setIsDarkMode(!isDarkMode);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return ()=> document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isDarkMode]);

  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Canvas 
        onClick={(e) => { if (!document.pointerLockElement) { e.currentTarget.requestPointerLock(); } }}
        shadows
        camera={{ position: [0, 1.5, 0], fov: 60 }}
      >
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0,1.5,0]} />
        <hemisphereLight intensity={0.5} />
        <ambientLight intensity={0.2} />
        <Physics gravity={[0,-9.81,0]}>
          <GroundPlane />
          <MovementController cameraRef={cameraRef} />
        </Physics>
        <ThemedEnvironment isDarkMode={isDarkMode}/>
        <SkyCube />
        {/* About panel on the left */}
        <InteractivePanel position={[-3,2,-5]} content={<AboutPanel />} />
        {/* Credits panel on the right */}
        <InteractivePanel position={[3,2,-5]} content={<CreditsPanel />} />
        <ReturnButton onClick={()=>{document.exitPointerLock(); navigate('/Home3D')}} />
        {/* Crosshair at center of screen */}
        <mesh position={[0,0,-1]}>
          <Html center>
            <div style={{width:'2px', height:'2px', background:'red'}}></div>
          </Html>
        </mesh>
      </Canvas>
    </div>
  );
};

export default Info3DPage;
