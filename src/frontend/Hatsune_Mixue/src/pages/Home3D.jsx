// Home3D.jsx
import React, { useRef, Suspense, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Html } from "@react-three/drei";
import Konbini from "../models/konbini(backup)";
import MovementController from "../components/MovementController";
import { useNavigate } from "react-router-dom";
import { Physics } from "@react-three/cannon";
import albumPictures from "../components/albumPictures";
import ImageCylinder from "../components/ImageCylinder";
import Loader from "../components/Loader";
import { applyTheme } from '../components/CheckTheme.jsx';
import { useDropzone } from "react-dropzone";
import axios from 'axios';
import * as THREE from 'three';

function Crosshair() {
  return (
    <div style={{
      position:'absolute',
      zIndex:1000,
      top:'50%',
      left:'50%',
      transform:'translate(-50%, -50%)',
      width:'2px',
      height:'2px',
      background:'red'
    }}></div>
  );
}

// A component to track player position inside Canvas
function PlayerPositionTracker({ cameraRef, onPositionChange }) {
  useFrame(() => {
    if (cameraRef.current) {
      const pos = cameraRef.current.position.clone();
      onPositionChange(pos);
    }
  });
  return null;
}

function PopupPanel({ title, onYes, onNo }) {
  return (
    <div style={{color:'#000',background:'#fff',padding:'20px',borderRadius:'10px'}}>
      <p>{title}</p>
      <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
        <button style={{background:'green',color:'#fff',padding:'5px',border:'none',cursor:'pointer'}} onClick={onYes}>Yes</button>
        <button style={{background:'red',color:'#fff',padding:'5px',border:'none',cursor:'pointer'}} onClick={onNo}>No</button>
      </div>
    </div>
  );
}

function HelpPopup({ show }) {
  if(!show) return null;
  return (
    <div
      style={{
        position:"absolute",
        top:"10%",
        right:"10%",
        backgroundColor:"rgba(0,0,0,0.8)",
        color:"white",
        padding:"20px",
        borderRadius:"10px",
        zIndex:9999
      }}
    >
      <h2 style={{ fontSize:"20px", marginBottom:"10px" }}>Info:</h2>
      <ul style={{ listStyleType:"none", padding:0, lineHeight:"1.8" }}>
        <li><strong>W,A,S,D</strong>: Move</li>
        <li><strong>ESC</strong>: Go back to Home2D</li>
        <li><strong>H</strong>: Show this popup</li>
        <li><strong>X</strong>: Close this popup</li>
        <li><strong>1</strong>: Teleport to Image Recognizer area</li>
        <li><strong>2</strong>: Teleport to Audio Recognizer area</li>
        <li><strong>3</strong>: Teleport to Info Page area</li>
        <li><strong>/</strong>: Toggle Dark/Light Mode</li>
      </ul>
    </div>
  );
}

const Home3D = () => {
  const cameraRef = useRef();
  const canvasRef = useRef();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [playerPos, setPlayerPos] = useState(new THREE.Vector3());

  // Teleport locations:
  const imageAreaPos = new THREE.Vector3(20,1.5,20);
  const audioAreaPos = new THREE.Vector3(-20,1.5,20);
  const infoAreaPos = new THREE.Vector3(0,1.5,-20);

  const [currentArea, setCurrentArea] = useState(null); // 'image','audio','info' or null
  const [showAreaPopup, setShowAreaPopup] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const [dropZoneType, setDropZoneType] = useState(null); // 'image' or 'audio'

  const triggerDistance = 3;

  useEffect(() => {
    applyTheme();
    const handlePointerLockChange = () => {
      if (!document.pointerLockElement && !loading) {
        navigate('/');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'x' || e.key === 'X') {
        setShowPopup(false);
      } else if (e.key === 'h' || e.key === 'H') {
        setShowPopup(true);
      } else if (e.key === '1') {
        if (cameraRef.current) {
          cameraRef.current.position.copy(imageAreaPos);
          cameraRef.current.position.y = 1.5;
          setCurrentArea('image');
        }
      } else if (e.key === '2') {
        if (cameraRef.current) {
          cameraRef.current.position.copy(audioAreaPos);
          cameraRef.current.position.y = 1.5;
          setCurrentArea('audio');
        }
      } else if (e.key === '3') {
        if (cameraRef.current) {
          cameraRef.current.position.copy(infoAreaPos);
          cameraRef.current.position.y = 1.5;
          setCurrentArea('info');
        }
      } else if (e.key === '/') {
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

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.exitPointerLock();
    };
  }, [navigate, loading, isDarkMode]);

  useEffect(() => {
    // Check proximity to show popup
    if (currentArea === 'image') {
      if (playerPos.distanceTo(imageAreaPos) < triggerDistance) setShowAreaPopup(true);
      else setShowAreaPopup(false);
    } else if (currentArea === 'audio') {
      if (playerPos.distanceTo(audioAreaPos) < triggerDistance) setShowAreaPopup(true);
      else setShowAreaPopup(false);
    } else if (currentArea === 'info') {
      if (playerPos.distanceTo(infoAreaPos) < triggerDistance) setShowAreaPopup(true);
      else setShowAreaPopup(false);
    } else {
      setShowAreaPopup(false);
    }
  }, [playerPos, currentArea]);

  const handleLoadingComplete = () => {
    setLoading(false);
    setShowPopup(true);
  };

  const handleAreaYes = () => {
    if (currentArea === 'image') {
      setDropZoneType('image');
      setShowDropZone(true);
    } else if (currentArea === 'audio') {
      setDropZoneType('audio');
      setShowDropZone(true);
    } else if (currentArea === 'info') {
      document.exitPointerLock();
      navigate('/Info3DPage');
    }
  };

  const handleAreaNo = () => {
    setShowAreaPopup(false);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (dropZoneType === 'image') {
      const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        alert("Please upload a valid image file.");
        return;
      }
      alert(`You have uploaded ${imageFiles.length} image file(s) for image recognition.`);
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('query_image', file);
      });
      try {
        const response = await axios.post('http://localhost:8000/search-image/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Image Query Success:', response.data);
        alert('Image query successful!');
      } catch (error) {
        console.error('Image Query Error:', error);
        alert('Error processing image query.');
      }
      setShowDropZone(false);
    } else if (dropZoneType === 'audio') {
      const audioFiles = acceptedFiles.filter(file => file.type.startsWith('audio/'));
      if (audioFiles.length === 0) {
        alert("Please upload a valid audio file.");
        return;
      }
      alert(`You have uploaded ${audioFiles.length} audio file(s) for audio recognition.`);
      const formData = new FormData();
      audioFiles.forEach(file => {
        formData.append('audio_file', file);
      });
      try {
        const response = await axios.post('http://localhost:8000/search-audio/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Audio Query Success:', response.data);
        alert('Audio query successful!');
      } catch (error) {
        console.error('Audio Query Error:', error);
        alert('Error processing audio query.');
      }
      setShowDropZone(false);
    }
  }, [dropZoneType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: !showDropZone });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showDropZone && (
        <div
          {...getRootProps()}
          style={{
            position:'absolute',
            top:'0',
            left:'0',
            right:'0',
            bottom:'0',
            background:'rgba(0,0,0,0.5)',
            zIndex:9999,
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            color:'#fff'
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the {dropZoneType} files here ...</p>
          ) : (
            <p>Drag 'n' drop {dropZoneType} files here, or click to select files</p>
          )}
        </div>
      )}

      <Canvas
        ref={canvasRef}
        onClick={(e) => {
          if (!document.pointerLockElement) {
            e.currentTarget.requestPointerLock();
          }
        }}
        shadows
        camera={{ position: [-3, 1.5, 3], fov: 45 }}
      >
        <Suspense fallback={<Loader onLoaded={handleLoadingComplete} />}>
          <PerspectiveCamera ref={cameraRef} makeDefault position={[-3, 1.5, 3]} />
          <hemisphereLight intensity={0.5} />
          <ambientLight intensity={0.2} />
          <Physics gravity={[0, -9.81, 0]}>
            <ImageCylinder images={albumPictures} />
            <Konbini position={[0, 0, 0]} scale={[1, 1, 1]} rotation={[0, 0, 0]} />
            <MovementController cameraRef={cameraRef} />
          </Physics>
          <PlayerPositionTracker cameraRef={cameraRef} onPositionChange={setPlayerPos} />
        </Suspense>
      </Canvas>

      <Crosshair />
      <HelpPopup show={showPopup} />
      {showAreaPopup && (
        <div style={{
          position:'absolute',
          top:'50%',
          left:'50%',
          transform:'translate(-50%,-50%)',
          zIndex:9999
        }}>
          <PopupPanel
            title={`Do you want to proceed with ${currentArea === 'image' ? 'Image Recognizer' : currentArea === 'audio' ? 'Audio Recognizer' : 'Info Page'}?`}
            onYes={handleAreaYes}
            onNo={handleAreaNo}
          />
        </div>
      )}
    </div>
  );
};

export default Home3D;
