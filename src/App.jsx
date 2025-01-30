import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Grid, OrbitControls, GizmoHelper, GizmoViewcube, PerspectiveCamera, OrthographicCamera, useGLTF, useTexture, useKTX2 } from '@react-three/drei';
import { useCameraStore } from './store/cameraStore';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

function Model() {
  const model = useGLTF('/259ce243-412b-4695-8add-e4f43779ed36 (2).glb');
  return <primitive position={[0, -0.5, 0]} scale={0.7} object={model.scene} />;
}

// Componente para manejar las capturas
function ScreenshotHandler({ onScreenshot }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const takeScreenshot = (angle) => {
      // Creamos una cámara virtual para las capturas
      const virtualCamera = new THREE.PerspectiveCamera(
        camera.fov,
        camera.aspect,
        camera.near,
        camera.far
      );

      // Configuramos la cámara virtual con posiciones absolutas
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
  }, [gl, scene, camera]);
  return null;
}

// Add new keyboard control component
function CameraKeyboardControls({ controlsRef }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!controlsRef.current) return;

      const camera = controlsRef.current.object;
      const currentPosition = camera.position.clone();
      const currentUp = camera.up.clone();

      let targetPosition = new THREE.Vector3();
      let targetUp = new THREE.Vector3(0, 1, 0);
      let duration = 1; // Duration in seconds

      switch (event.key) {
        case '8': // Front view
          targetPosition.set(0, 0, 8);
          break;
        case '2': // Back view
          targetPosition.set(0, 0, -8);
          break;
        case '4': // Left view
          targetPosition.set(-8, 0, 0);
          break;
        case '6': // Right view
          targetPosition.set(8, 0, 0);
          break;
        case '5': // Top view
          targetPosition.set(0, 8, 0);
          targetUp.set(0, 0, -1);
          break;
        case '0': // Bottom view
          targetPosition.set(0, -8, 0);
          targetUp.set(0, 0, 1);
          break;
        default:
          return;
      }
      // Animation function
      const startTime = Date.now();
      function animate() {
        const elapsed = (Date.now() - startTime) / 1000; // Convert to seconds
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function
        const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        // Interpolate position
        camera.position.lerpVectors(currentPosition, targetPosition, eased);

        // Interpolate up vector
        camera.up.lerpVectors(currentUp, targetUp, eased);

        // Make camera look at center
        camera.lookAt(0, 0, 0);
        controlsRef.current.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      animate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controlsRef]);
  return null;
}

// Componente del cubo con la textura .ktx2
function TexturedCube({ position, setLoadingProgress, setCurrentResolution }) {
  const meshRef = useRef();
  const textureRef = useRef();
  const [currentMipmapLevel, setCurrentMipmapLevel] = React.useState(12);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const loader = new KTX2Loader();
    loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.146.0/examples/js/libs/basis/');
    loader.detectSupport(new THREE.WebGLRenderer());

    const loadTexture = async () => {
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

        textureRef.current = texture;
        
        // Configuración inicial
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.anisotropy = 16;
        texture.needsUpdate = true;

        // Actualizar el material
        if (meshRef.current) {
          meshRef.current.material.map = texture;
          meshRef.current.material.needsUpdate = true;
        }

        // Progresión de mipmaps
        const interval = setInterval(() => {
          if (currentMipmapLevel > 0) {
            setCurrentMipmapLevel(prev => prev - 1);
          } else {
            clearInterval(interval);
          }
        }, 500);

        setIsLoading(false);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error loading texture:', error);
        const fallbackTexture = new THREE.TextureLoader().load('/fallback-texture.jpg');
        if (meshRef.current) {
          meshRef.current.material.map = fallbackTexture;
          meshRef.current.material.needsUpdate = true;
        }
        setIsLoading(false);
      }
    };

    loadTexture();

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    
    if (textureRef.current && !isLoading) {
      const validMipmapLevel = Math.max(0, currentMipmapLevel);
      
      // Configurar el filtrado para el efecto borroso
      textureRef.current.minFilter = THREE.LinearMipmapLinearFilter;
      textureRef.current.magFilter = THREE.LinearFilter;
      textureRef.current.mipmap = validMipmapLevel;
      textureRef.current.needsUpdate = true;
      
      // Obtener la resolución actual
      const currentMipmap = textureRef.current.mipmaps[validMipmapLevel];
      const resolution = currentMipmap ? `${currentMipmap.width}x${currentMipmap.height}` : 'Cargando...';
      setCurrentResolution(resolution);
      
      // Logs con efecto de transición
      console.log(`Mipmap actual: ${validMipmapLevel} - Resolución: ${resolution}`);
      
      // Configurar el intervalo con transición suave
      interval = setInterval(() => {
        if (currentMipmapLevel > 0) {
          setCurrentMipmapLevel(prev => Math.max(0, prev - 1));
        } else {
          clearInterval(interval);
        }
      }, 1000); // Aumentamos el intervalo para un efecto más suave
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentMipmapLevel, isLoading, setCurrentResolution]);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        map={textureRef.current} 
        roughness={0.8}
        metalness={0.2}
        transparent={true}
        opacity={currentMipmapLevel > 0 ? 0.8 : 1}
      />
    </mesh>
  );
}

function App() {
  const { position, isOrthographic, toggleProjection, resetPosition } = useCameraStore();
  const screenshotRef = useRef(null);
  const controlsRef = useRef();
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [currentResolution, setCurrentResolution] = React.useState('Cargando...');

  // Crear una cuadrícula de cubos
  const gridSize = 10; // Tamaño de la cuadrícula (10x10 = 100 cubos)
  const spacing = 1.5; // Espacio entre cubos

  const takeScreenshot = async (angle) => {
    try {
      if (screenshotRef.current) {
        // Deshabilitamos los controles
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
        const webpData = await screenshotRef.current(angle);

        // Habilitamos los controles
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
        const link = document.createElement('a');
        link.href = webpData;
        link.download = `modelo-3d-${angle}.webp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error al tomar la captura:', error);
    }
  };
  return (
    <div className="canvas-container">
      {/* Overlay de carga */}
      {loadingProgress < 100 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          color: 'white',
          textAlign: 'center'
        }}>
          <div>Cargando... {loadingProgress}%</div>
          <div>Resolución actual: {currentResolution}</div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1,
        display: 'flex',
        gap: '10px',
      }}>
        <button color="primary" variant="flat" onClick={toggleProjection}>
          {isOrthographic ? 'Perspectiva' : 'Ortográfica'}
        </button>
        <button color="primary" variant="flat" onClick={resetPosition}>
          Reset Cámara
        </button>
        <button onClick={() => takeScreenshot('front')}>Captura Frontal</button>
        <button onClick={() => takeScreenshot('side')}>Captura Lateral</button>
        <button onClick={() => takeScreenshot('top')}>Captura Superior</button>
        <button onClick={() => takeScreenshot('isometric')}>Captura Isométrica</button>
      </div>
      <Canvas style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
      }}>
        <ScreenshotHandler onScreenshot={(handler) => {
          screenshotRef.current = handler;
        }} />

        <CameraKeyboardControls controlsRef={controlsRef} />

        {isOrthographic ? (
          <OrthographicCamera makeDefault position={position} zoom={50} />
        ) : (
          <PerspectiveCamera makeDefault position={position} />
        )}
        {/* <Model /> */}
        {Array.from({ length: gridSize }).map((_, x) =>
          Array.from({ length: gridSize }).map((_, z) => (
            <TexturedCube
              key={`${x}-${z}`}
              position={[x * spacing - (gridSize * spacing) / 2, 0, z * spacing - (gridSize * spacing) / 2]}
              setLoadingProgress={setLoadingProgress}
              setCurrentResolution={setCurrentResolution}
            />
          ))
        )}
        <Grid cellColor="white" args={[10, 10]} position={[0, -0.5, 0]} />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewcube />
        </GizmoHelper>
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.5}
        />
        <OrbitControls ref={controlsRef} />
      </Canvas>
    </div>
  );
}

export default App;
