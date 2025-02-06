import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { useTexture } from '@react-three/drei';
import { useTextureStore } from '../store/textureStore';

function TexturedCube({ name, position, setLoadingProgress, setCurrentResolution, texture }) {
  const [currentMipmapLevel, setCurrentMipmapLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const textureRef = useRef(null);
  const materialsRef = useRef([]);
  
  const [normalMap, roughnessMap] = useTexture([
    '/normal.jpeg',
    '/roughness.jpeg'
  ]);
  const { textureOffset } = useTextureStore();
  // Memoize the KTX2Loader instance
  const loader = useMemo(() => {
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.146.0/examples/js/libs/basis/');
    ktx2Loader.detectSupport(new THREE.WebGLRenderer());
    return ktx2Loader;
  }, []);
  
  // Load texture in useEffect
  useEffect(() => {
    let isMounted = true;

    const loadTexture = async () => {
      try {
        const loadedTexture = await new Promise((resolve, reject) => {
          loader.load('/texture9.ktx2', 
            resolve,
            (xhr) => {
              if (isMounted) {
                const progress = Math.round((xhr.loaded / xhr.total) * 100);
                setLoadingProgress(progress);
              }
            },
            reject
          );
        });

        if (!isMounted) return;

        // loadedTexture.minFilter = THREE.LinearFilter;
        // loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.generateMipmaps = false;
        
        const lastMipmapLevel = loadedTexture.mipmaps.length - 1;
        loadedTexture.mipmapLevel = lastMipmapLevel;
        loadedTexture.needsUpdate = true;
        
        console.log('Textura inicial cargada:', {
          mipmaps: loadedTexture.mipmaps.length,
          currentLevel: lastMipmapLevel,
          resolution: `${loadedTexture.mipmaps[lastMipmapLevel].width}x${loadedTexture.mipmaps[lastMipmapLevel].height}`
        });
        
        textureRef.current = loadedTexture;
        
        // Create materials
        materialsRef.current = Array.from({ length: 6 }).map(() => {
          return new THREE.MeshStandardMaterial({
            map: loadedTexture,
            normalMap,
            roughnessMap,
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: 1
          });
        });

        if (isMounted) {
          setCurrentMipmapLevel(lastMipmapLevel);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading texture:', error);
      }
    };

    loadTexture();

    return () => {
      isMounted = false;
      // Cleanup
      if (textureRef.current) {
        textureRef.current.dispose();
      }
      materialsRef.current.forEach(material => {
        if (material) material.dispose();
      });
      loader.dispose();
    };
  }, [loader, setLoadingProgress]);

  // Progressive loading effect
  useEffect(() => {
    if (!isLoading && textureRef.current && currentMipmapLevel !== null) {
      const progressiveLoad = setInterval(() => {
        if (currentMipmapLevel > 0) {
          const nextLevel = currentMipmapLevel - 1;
          setCurrentMipmapLevel(nextLevel);
          
          const currentMipmap = textureRef.current.mipmaps[nextLevel];
          materialsRef.current.forEach(material => {
            if (material.map) {
              material.map.mipmapLevel = nextLevel;
              material.map.needsUpdate = true;
              material.needsUpdate = true;
            }
          });

          setCurrentResolution(`${currentMipmap.width}x${currentMipmap.height}`);
        } else {
          clearInterval(progressiveLoad);
        }
      }, 200);

      return () => clearInterval(progressiveLoad);
    }
  }, [currentMipmapLevel, isLoading, setCurrentResolution]);

  // Actualizar el offset de las texturas cuando cambie
  useEffect(() => {
    materialsRef.current.forEach(material => {
      if (material && material.map) {
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.offset.x = textureOffset;
        material.map.needsUpdate = true;
      }
    });
  }, [textureOffset]);

  return (
    <group position={position} name={name}>
      {/* Cara frontal */}
      <mesh material={materialsRef.current[0]}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Cara trasera */}
      <mesh position={[0, 0, -1]} material={materialsRef.current[1]}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Cara superior */}
      <mesh position={[0, 0.5, -0.5]} rotation={[Math.PI / 2, 0, 0]} material={materialsRef.current[2]}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Cara inferior */}
      <mesh position={[0, -0.5, -0.5]} rotation={[Math.PI / 2, 0, 0]} material={materialsRef.current[3]}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Cara derecha */}
      <mesh position={[0.5, 0, -0.5]} rotation={[0, Math.PI / 2, 0]} material={materialsRef.current[4]}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Cara izquierda */}
      <mesh position={[-0.5, 0, -0.5]} rotation={[0, Math.PI / 2, 0]} material={materialsRef.current[5]}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  );
}

export default TexturedCube; 