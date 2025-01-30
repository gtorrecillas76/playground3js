import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { useTexture } from '@react-three/drei';

function TexturedCube({ name, position, setLoadingProgress, setCurrentResolution }) {
  const [currentMipmapLevel, setCurrentMipmapLevel] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const materialsRef = useRef([]);
  
  // Load normal map using useTexture
  const [normalMap, roughnessMap] = useTexture([
    '/normal.jpeg',
    '/roughness.jpeg'
  ]);

  useEffect(() => {
    const loader = new KTX2Loader();
    loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.146.0/examples/js/libs/basis/');
    loader.detectSupport(new THREE.WebGLRenderer());

    const loadBaseTexture = async () => {
      try {
        const texture = await new Promise((resolve, reject) => {
          loader.load('/texture.ktx2', 
            resolve, 
            (xhr) => {
              const progress = Math.round((xhr.loaded / xhr.total) * 100);
              setLoadingProgress(progress);
            }, 
            reject
          );
        });

        // Create materials with base color from KTX2 and normal map
        materialsRef.current = Array.from({ length: 6 }).map(() => {
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: currentMipmapLevel === 0 ? 0.8 : 1
          });
          return material;
        });

        // Configuración inicial de la textura base (KTX2)
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.anisotropy = 16;
        texture.needsUpdate = true;

        // Configuración del normal map (JPG)
        if (normalMap) {
          normalMap.minFilter = THREE.LinearMipmapLinearFilter;
          normalMap.magFilter = THREE.LinearFilter;
          normalMap.generateMipmaps = true;
          normalMap.anisotropy = 16;
          normalMap.needsUpdate = true;
        }

        // Configuración del roughness map (JPG)
        if (roughnessMap) {
          roughnessMap.minFilter = THREE.LinearMipmapLinearFilter;
          roughnessMap.magFilter = THREE.LinearFilter;
          roughnessMap.generateMipmaps = true;
          roughnessMap.anisotropy = 16;
          roughnessMap.needsUpdate = true;
        }

        // Progresión de mipmaps con transición suave
        const applyMipmapWithTransition = (targetLevel) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              setCurrentMipmapLevel(targetLevel);
              resolve();
            }, 1000); // Timeout de 1 segundo para probar la transición
          });
        };

        const applyMipmaps = async () => {
          for (let i = 0; i < texture.mipmaps.length; i++) {
            await applyMipmapWithTransition(i);
          }
        };

        applyMipmaps();

        setIsLoading(false);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error loading base texture:', error);
        const fallbackTexture = new THREE.TextureLoader().load('/fallback-texture.jpg');
        materialsRef.current = Array.from({ length: 6 }).map(() => {
          return new THREE.MeshStandardMaterial({
            map: fallbackTexture,
            roughness: 0.8,
            metalness: 0.2
          });
        });
        setIsLoading(false);
      }
    };

    loadBaseTexture();

    return () => {
      materialsRef.current.forEach(material => material.dispose());
    };
  }, [normalMap, roughnessMap, setLoadingProgress]);

  useEffect(() => {
    if (materialsRef.current.length > 0 && !isLoading) {
      // Actualizar materiales con el nivel de mipmap actual
      materialsRef.current.forEach(material => {
        if (material.map) {
          material.map.mipmap = currentMipmapLevel;
          material.map.needsUpdate = true;
          material.opacity = currentMipmapLevel === 0 ? 0.8 : 1;
          material.needsUpdate = true;
        }
      });

      // Obtener la resolución actual
      const currentMipmap = materialsRef.current[0].map.mipmaps[currentMipmapLevel];
      const resolution = currentMipmap ? `${currentMipmap.width}x${currentMipmap.height}` : 'Cargando...';
      setCurrentResolution(resolution);
    }
  }, [currentMipmapLevel, isLoading, setCurrentResolution]);

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