import { useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useCameraStore } from '../store/cameraStore';

function CameraControls({ controlsRef }) {
  const { setCameraState, position, target } = useCameraStore();

  useEffect(() => {
    if (!controlsRef.current) return;

    // Initialize controls with stored position
    controlsRef.current.object.position.set(position[0], position[1], position[2]);
    controlsRef.current.target.set(target[0], target[1], target[2]);
    controlsRef.current.update();
  }, [controlsRef, position, target]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enableDamping={false}
      onEnd={() => {
        // Called when user finishes dragging/zooming
        if (!controlsRef.current) return;
        
        const camera = controlsRef.current.object;
        const target = controlsRef.current.target;
        
        const newPosition = [camera.position.x, camera.position.y, camera.position.z];
        const newRotation = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
        const newTarget = [target.x, target.y, target.z];
        
        setCameraState(newPosition, newRotation, newTarget);
      }}
    />
  );
}

export default CameraControls;