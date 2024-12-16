// src/models/HillBackground.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { HillBackgroundVertexShader } from "./HillBackgroundVertexShader.js";
import { HillBackgroundFragmentShader } from "./HillBackgroundFragmentShader.js";

const HillBackground = ({ is3DMode = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (is3DMode) {
      // If we're in 3D mode scenario, we won't render to a separate canvas.
      // This component can be skipped or used as a material in 3D.
      return;
    }

    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      canvas: canvas,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.set(0, 16, 128);
    camera.lookAt(new THREE.Vector3(0, 28, 0));

    const clock = new THREE.Clock();

    class Plane {
      constructor() {
        this.uniforms = {
          time: { value: 0 },
        };
        this.mesh = this.createMesh();
        this.time = 1;
      }

      createMesh() {
        const geometry = new THREE.PlaneGeometry(256, 256, 256, 256);
        const material = new THREE.RawShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: HillBackgroundVertexShader,
          fragmentShader: HillBackgroundFragmentShader,
          transparent: true,
          depthWrite: false,
          depthTest: true,
        });
        return new THREE.Mesh(geometry, material);
      }

      render(deltaTime) {
        this.uniforms.time.value += deltaTime * this.time;
      }

      dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
      }
    }

    const plane = new Plane();
    scene.add(plane.mesh);

    const resizeWindow = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", resizeWindow);

    const handleThemeChange = () => {
      const isDarkMode = document.body.classList.contains("dark-mode");
      renderer.setClearColor(isDarkMode ? 0x1a1a1a : 0xeeeeee, 1.0);
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const animate = () => {
      requestAnimationFrame(animate);
      plane.render(clock.getDelta());
      renderer.render(scene, camera);
    };

    animate();

    resizeWindow();

    return () => {
      window.removeEventListener("resize", resizeWindow);
      observer.disconnect();
      plane.dispose();
      renderer.dispose();
      scene.remove(plane.mesh);
    };
  }, [is3DMode]);

  if (is3DMode) {
    // If used in 3D mode, return null because we do not render this as a separate canvas.
    return null;
  }

  return <canvas ref={canvasRef} id="canvas-webgl" className="hill-background-canvas" />;
};

export default HillBackground;
