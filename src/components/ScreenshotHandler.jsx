import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function ScreenshotHandler({ onScreenshot }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const takeScreenshot = (angle) => {
      // Crear una cámara virtual para las capturas
      const virtualCamera = new THREE.PerspectiveCamera(
        camera.fov,
        camera.aspect,
        camera.near,
        camera.far
      );

      // Configurar la cámara virtual con posiciones absolutas
      switch (angle) {
        case 'front':
          virtualCamera.position.set(0, 0, 8);
          virtualCamera.up.set(0, 1, 0);
          break;
        case 'side':
          virtualCamera.position.set(8, 0, 0);
          virtualCamera.up.set(0, 1, 0);
          break;
        case 'top':
          virtualCamera.position.set(0, 8, 0);
          virtualCamera.up.set(0, 0, -1);
          break;
        case 'isometric':
          virtualCamera.position.set(8, 8, 8);
          virtualCamera.up.set(0, 1, 0);
          break;
      }
      virtualCamera.lookAt(0, 0, 0);
      virtualCamera.updateProjectionMatrix();
      virtualCamera.updateMatrixWorld();

      // Render y captura
      gl.render(scene, virtualCamera);

      return new Promise((resolve) => {
        gl.domElement.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        }, 'image/webp', 1.0);
      });
    };

    if (onScreenshot) {
      onScreenshot(takeScreenshot);
    }
  }, [gl, scene, camera, onScreenshot]);

  return null;
}

export default ScreenshotHandler; 