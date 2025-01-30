import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { useTexture } from '@react-three/drei';

function TexturedCube({ name, position, setLoadingProgress, setCurrentResolution }) {
  const [currentMipmapLevel, setCurrentMipmapLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const materialsRef = useRef([]);
  const textureRef = useRef(null);
  
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
          loader.load('/texture11k.ktx2', 
            (loadedTexture) => {
              // Use linear filtering for smoother transitions

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
              setCurrentMipmapLevel(lastMipmapLevel);
              
              resolve(loadedTexture);
            }, 
            (xhr) => {
              const progress = Math.round((xhr.loaded / xhr.total) * 100);
              setLoadingProgress(progress);
            }, 
            reject
          );
        });

        // Create materials
        materialsRef.current = Array.from({ length: 6 }).map(() => {
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: 1
          });
          return material;
        });

        setIsLoading(false);

      } catch (error) {
        console.error('Error loading texture:', error);
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

  // Progressive loading effect
  useEffect(() => {
    if (!isLoading && textureRef.current && currentMipmapLevel !== null) {
      const progressiveLoad = setInterval(() => {
        if (currentMipmapLevel > 0) {
          const nextLevel = currentMipmapLevel - 1;
          setCurrentMipmapLevel(nextLevel);
          
          const currentMipmap = textureRef.current.mipmaps[nextLevel];
          console.log('Actualizando mipmap:', {
            nivel: nextLevel,
            resolucion: `${currentMipmap.width}x${currentMipmap.height}`,
            datosTextura: {
              minFilter: textureRef.current.minFilter,
              magFilter: textureRef.current.magFilter,
              formato: textureRef.current.format,
              tipo: textureRef.current.type
            }
          });
          
          // Update all materials
          materialsRef.current.forEach((material, index) => {
            if (material.map) {
              material.map.mipmapLevel = nextLevel;
              material.map.needsUpdate = true;
              material.needsUpdate = true;
              
              console.log(`Material ${index} actualizado:`, {
                opacidad: material.opacity,
                visible: material.visible,
                mipmapLevel: material.map.mipmapLevel
              });
            }
          });

          setCurrentResolution(`${currentMipmap.width}x${currentMipmap.height}`);
        } else {
          console.log('Carga progresiva completada');
          clearInterval(progressiveLoad);
        }
      }, 200);

      return () => clearInterval(progressiveLoad);
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