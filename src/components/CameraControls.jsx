import { useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useCameraStore } from '../store/cameraStore';
import { forwardRef } from 'react';

const CameraControlsComponent = forwardRef((props, ref) => {
  const { setCameraState, position, target } = useCameraStore();

  useEffect(() => {
    if (!ref.current) return;

    // Initialize controls with stored position
    ref.current.object.position.set(position[0], position[1], position[2]);
    ref.current.target.set(target[0], target[1], target[2]);
    ref.current.update();
  }, [ref, position, target]);

  return (
    <OrbitControls 
      ref={ref}
      // enableDamping={true}
      // dampingFactor={0.1}

      onEnd={() => {
        if (!ref.current) return;
        
        const camera = ref.current.object;
        const target = ref.current.target;
        
        const newPosition = [camera.position.x, camera.position.y, camera.position.z];
        const newRotation = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
        const newTarget = [target.x, target.y, target.z];
        
        setCameraState(newPosition, newRotation, newTarget);
      }}
    />
  );
});

CameraControlsComponent.displayName = 'CameraControls';

export default CameraControlsComponent;