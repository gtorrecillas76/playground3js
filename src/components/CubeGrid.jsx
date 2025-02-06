import TexturedCube from './TexturedCube';
import { useTextureStore } from '../store/textureStore';
import { useMemo } from 'react';
import * as THREE from 'three';

function CubeGrid({ setLoadingProgress, setCurrentResolution, texture }) {
  const gridSize = 1; // Tamaño de la cuadrícula (10x10 = 100 cubos)
  const spacing = 1.2; // Espacio entre cubos
  const { textureOffset } = useTextureStore();

  // const material = useMemo(() => {
  //   return new THREE.MeshStandardMaterial({
  //     map: texture,
  //     onUpdate: (self) => {
  //       if (self.map) {
  //         // Apply texture offset
  //         self.map.offset.x = textureOffset;
  //         self.map.wrapS = THREE.RepeatWrapping;
  //         self.map.wrapT = THREE.RepeatWrapping;
  //         self.map.needsUpdate = true;
  //       }
  //     }
  //   });
  // }, [texture, textureOffset]); // Add textureOffset as dependency

  return (
    <>
      {Array.from({ length: gridSize }).map((_, x) =>
        Array.from({ length: gridSize }).map((_, z) => (
          <TexturedCube
            key={`${x}-${z}`}
            name={`cubo-${x}-${z}`}
            position={[x * spacing - (gridSize * spacing) / 2, 0, z * spacing - (gridSize * spacing) / 2]}
            // material={material}
            setLoadingProgress={setLoadingProgress}
            setCurrentResolution={setCurrentResolution}
          />
        ))
      )}
    </>
  );
}

export default CubeGrid; 