// Info3DPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Html } from "@react-three/drei";
import { Physics, usePlane } from "@react-three/cannon";
import MovementController from "../components/MovementController.jsx";
import { useNavigate } from 'react-router-dom';
import { applyTheme } from '../components/CheckTheme.jsx';
import * as THREE from 'three';

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

function GroundPlane() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0,0,0]
  }));
  return (
    <mesh ref={ref} receiveShadow rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

function TopPlane() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI/2, 0, 0],
    position: [0,100,0]
  }));
  return (
    <mesh ref={ref} rotation={[-Math.PI/2,0,0]} visible={false}>
      <planeGeometry args={[2000,2000]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

// CubeEmitter with minimum distance from origin
function CubeEmitter() {
  const [cubes, setCubes] = useState([]);

  // We'll require that cubes spawn at least 300 units away from (0,0)
  function getRandomPositionFarAway() {
    let x, z;
    const minDistance = 20;
    do {
      x = (Math.random() - 0.5)*2000; 
      z = (Math.random() - 0.5)*2000; 
    } while (Math.sqrt(x*x + z*z) < minDistance);
    return {x,z};
  }

  // Spawn 2 cubes every second, but at least 300 units away from origin
  useEffect(() => {
    const interval = setInterval(() => {
      setCubes((prev) => {
        const newCubes = [...prev];
        for (let i = 0; i < 2; i++) {
          const {x,z} = getRandomPositionFarAway();
          newCubes.push({ id: crypto.randomUUID(), x, y:0, z, velocity:1+Math.random()*2 });
        }
        return newCubes;
      });
    }, 500); 
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    setCubes(prev => {
      const newCubes = [];
      for (const c of prev) {
        const newY = c.y + c.velocity; 
        if (newY < 100) {
          newCubes.push({ ...c, y: newY });
        }
      }
      return newCubes;
    });
  });

  return (
    <group>
      {cubes.map(cube => (
        <mesh key={cube.id} position={[cube.x, cube.y, cube.z]}>
          <boxGeometry args={[5,5,5]} />
          <meshStandardMaterial color="purple" />
        </mesh>
      ))}
    </group>
  );
}

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

function ReturnButton({ onClick }) {
  return (
    <mesh position={[0,1,-5]}>
      <planeGeometry args={[1,0.5]} />
      <meshBasicMaterial color="white" transparent opacity={0}/>
      <Html center transform distanceFactor={5} style={{pointerEvents:'auto'}}>
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

function Info3DPage() {
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
    <div style={{width:'100vw',height:'100vh', position:'relative'}}>
      <div style={{
        position:'absolute',
        zIndex:999999,
        top:'50%',
        left:'50%',
        transform:'translate(-50%, -50%)',
        width:'5px',
        height:'5px',
        background:'red',
        borderRadius:'50%'
      }}></div>

      <Canvas 
        onClick={(e) => { if (!document.pointerLockElement) { e.currentTarget.requestPointerLock(); } }}
        shadows
        camera={{ position: [0, 1.5, 0], fov: 60 }}
      >
        <PerspectiveCamera ref={cameraRef} makeDefault position={[1,2,0]} />
        <hemisphereLight intensity={0.5} />
        <ambientLight intensity={0.2} />
        <Physics gravity={[0,-9.81,0]}>
          <GroundPlane />
          <TopPlane />
          <MovementController cameraRef={cameraRef} />
        </Physics>
        <ThemedEnvironment isDarkMode={isDarkMode}/>
        <CubeEmitter />
        <InteractivePanel position={[-3,2,-5]} content={<AboutPanel />} />
        <InteractivePanel position={[3,2,-5]} content={<CreditsPanel />} />
        <ReturnButton onClick={()=>{document.exitPointerLock(); navigate('/Home3D')}} />
      </Canvas>
    </div>
  );
};

function ThemedEnvironment({ isDarkMode }) {
  const { scene } = useThree();

  useEffect(() => {
    if (isDarkMode) {
      scene.background = new THREE.Color(0x0a0a28);
    } else {
      scene.background = new THREE.Color(0xffeedd);
    }
  }, [isDarkMode, scene]);

  return null;
}

export default Info3DPage;
