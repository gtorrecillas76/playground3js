import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function LogCubes() {
  const { scene } = useThree();

  useEffect(() => {
    // Función para loguear todos los cubos en un solo objeto
    const logAllCubes = () => {
      const cubesInfo = {};

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry instanceof THREE.PlaneGeometry) {
          // Agregar información del cubo al objeto
          cubesInfo[object.uuid] = {
            name: object.name || 'Sin nombre', // Incluir el nombre del cubo
            position: object.position.toArray(),
            rotation: object.rotation.toArray(),
            material: object.material ? object.material.type : 'No material',
            geometry: object.geometry.type,
          };
        }
      });

      // Loguear el objeto con todos los cubos
      console.log('Cubos en la escena:', cubesInfo);
    };

    // Loguear los cubos cada 2 segundos (solo para pruebas)
    const interval = setInterval(logAllCubes, 2000);

    return () => clearInterval(interval);
  }, [scene]);

  return null;
}

export default LogCubes; 