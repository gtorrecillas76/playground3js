import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { useCameraStore } from './store/cameraStore';
import CameraControls from './components/CameraControls';
import Lighting from './components/Lighting';
import GridHelper from './components/GridHelper';
import CubeGrid from './components/CubeGrid';
import ScreenshotHandler from './components/ScreenshotHandler';
import LoadingOverlay from './components/LoadingOverlay';
import LogCubes from './components/LogCubes';
import TextureSlider from './components/TextureSlider';


function App() {
  const { position, rotation, target, isOrthographic, toggleProjection, resetPosition } = useCameraStore();
  const screenshotRef = useRef(null);
  const controlsRef = useRef();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentResolution, setCurrentResolution] = useState('Cargando...');

  return (
    <div className="canvas-container">
      {/* Overlay de carga */}
      {/* <LoadingOverlay loadingProgress={loadingProgress} currentResolution={currentResolution} /> */}

      {/* Botones de UI */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1,
        display: 'flex',
        gap: '10px',
      }}>
        <button onClick={toggleProjection}>
          {isOrthographic ? 'Perspectiva' : 'Ortográfica'}
        </button>
        <button onClick={resetPosition}>Reset Cámara</button>
        <button onClick={() => screenshotRef.current('front')}>Captura Frontal</button>
        <button onClick={() => screenshotRef.current('side')}>Captura Lateral</button>
        <button onClick={() => screenshotRef.current('top')}>Captura Superior</button>
        <button onClick={() => screenshotRef.current('isometric')}>Captura Isométrica</button>
      </div>

      <TextureSlider />

      {/* Canvas principal */}
      <Canvas style={{ width: '100vw', height: '100vh', background: '#000' }}>
        {/* Componentes de la escena */}
        <ScreenshotHandler onScreenshot={(handler) => (screenshotRef.current = handler)} />
        <CameraControls controlsRef={controlsRef} />
        
        {/* Simplified camera setup */}
        {isOrthographic ? (
          <OrthographicCamera 
            makeDefault 
            position={position}
            rotation={rotation}
            zoom={50}
            near={-1000}
            far={1000}
          />
        ) : (
          <PerspectiveCamera 
            makeDefault 
            position={position}
            rotation={rotation}
            fov={75}
            near={0.1}
            far={1000}
          />
        )}
        
        <Lighting />
        <GridHelper />
        <CubeGrid setLoadingProgress={setLoadingProgress} setCurrentResolution={setCurrentResolution} />
        {/* <LogCubes /> */}


      </Canvas>
    </div>
  );
}

export default App;
