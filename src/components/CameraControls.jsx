import React, { useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useCameraStore } from '../store/cameraStore';

function CameraControls() {
  const { controlsRef } = useCameraStore();

  return <OrbitControls ref={controlsRef} />;
}

export default CameraControls; 