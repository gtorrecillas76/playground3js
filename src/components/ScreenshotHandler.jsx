import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function ScreenshotHandler({ onScreenshot, controlsRef }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const takeScreenshot = async (angle) => {
      if (!controlsRef.current) {
        console.error('No controlsRef.current available');
        return;
      }

      // Store current camera state
      const currentCamera = camera;
      const oldPosition = currentCamera.position.clone();
      const oldRotation = currentCamera.rotation.clone();
      const oldUp = currentCamera.up.clone();
      const oldTarget = controlsRef.current.target.clone();

      // Create virtual camera with same properties as current camera
      const virtualCamera = currentCamera.clone();

      if (angle === 'current') {
        // Use current camera position and orientation
        virtualCamera.position.copy(currentCamera.position);
        virtualCamera.rotation.copy(currentCamera.rotation);
        virtualCamera.up.copy(currentCamera.up);
      } else {
        // Set camera positions based on angle
        switch (angle) {
          case 'front':
            virtualCamera.position.set(0, 0, 8);
            virtualCamera.up.set(0, 1, 0);
            controlsRef.current.target.set(0, 0, 0);
            break;
          case 'side':
            virtualCamera.position.set(8, 0, 0);
            virtualCamera.up.set(0, 1, 0);
            controlsRef.current.target.set(0, 0, 0);
            break;
          case 'top':
            virtualCamera.position.set(0, 8, 0);
            virtualCamera.up.set(0, 0, -1);
            controlsRef.current.target.set(0, 0, 0);
            break;
          case 'isometric':
            virtualCamera.position.set(8, 8, 8);
            virtualCamera.up.set(0, 1, 0);
            controlsRef.current.target.set(0, 0, 0);
            break;
        }
        virtualCamera.lookAt(0, 0, 0);
      }

      virtualCamera.updateProjectionMatrix();
      virtualCamera.updateMatrixWorld();

      // Take screenshot
      gl.render(scene, virtualCamera);
      
      try {
        const blob = await new Promise(resolve => {
          gl.domElement.toBlob(resolve, 'image/png', 1.0);
        });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `screenshot-${angle}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Restore original camera state
        currentCamera.position.copy(oldPosition);
        currentCamera.rotation.copy(oldRotation);
        currentCamera.up.copy(oldUp);
        controlsRef.current.target.copy(oldTarget);
        currentCamera.updateProjectionMatrix();
        controlsRef.current.update();

        console.log('Screenshot saved');
        return url;
      } catch (error) {
        console.error('Screenshot failed:', error);
        return null;
      }
    };

    if (onScreenshot) {
      onScreenshot(takeScreenshot);
    }
  }, [gl, scene, camera, controlsRef, onScreenshot]);

  return null;
}

export default ScreenshotHandler; 