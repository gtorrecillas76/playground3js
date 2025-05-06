import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PivotControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const materials = [
  {
    name: 'Stainless Steel Satin',
    textures: {
      baseColor: '/Stainless_Steel_Satin_BaseColor.jpg',
      normal: '/Stainless_Steel_Satin_Normal.jpg',
      roughness: '/Stainless_Steel_Satin_Roughness.jpg',
      metallic: '/Stainless_Steel_Satin_Metallic.jpg',
    }
  },
  {
    name: 'Stainless Steel Polished',
    textures: {
      baseColor: '/Stainless_Steel_Polished_BaseColor.jpg',
      normal: '/Stainless_Steel_Polished_Normal.jpg',
      roughness: '/Stainless_Steel_Polished_Roughness.jpg',
      metallic: '/Stainless_Steel_Polished_Metallic.jpg',
    }
  },
  {
    name: 'Stainless Steel Brushed',
    textures: {
      baseColor: '/Stainless_Steel_Brushed_BaseColor.jpg',
      normal: '/Stainless_Steel_Brushed_Normal.jpg',
      roughness: '/Stainless_Steel_Brushed_Roughness.jpg',
      metallic: '/Stainless_Steel_Brushed_Metallic.jpg',
    }
  }
];

const assets = [
  {
    name: 'B10 388.glb',
    type: 'model',
    path: 'public/B10 388.glb',
    thumbnail: 'public/B10 388.webp',
  },
  // Puedes agregar más assets aquí
];

function CubeGrid({ materialIndex, onPivotStart, onPivotEnd, isGroupMode, savedPositions, onSavePositions, groupRef }) {
  const textureLoader = new THREE.TextureLoader();
  
  const currentMaterial = materials[materialIndex];
  const baseColorMap = textureLoader.load(currentMaterial.textures.baseColor);
  const normalMap = textureLoader.load(currentMaterial.textures.normal);
  const roughnessMap = textureLoader.load(currentMaterial.textures.roughness);
  const metalnessMap = textureLoader.load(currentMaterial.textures.metallic);

  // Adjust texture properties
  baseColorMap.encoding = THREE.sRGBEncoding;
  baseColorMap.repeat.set(1, 1);
  baseColorMap.wrapS = baseColorMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(1, 1);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(1, 1);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  metalnessMap.repeat.set(1, 1);
  metalnessMap.wrapS = metalnessMap.wrapT = THREE.RepeatWrapping;

  const gridSize = 2;
  const spacing = 2.5;
  const offset = ((gridSize - 1) * spacing) / 2;

  const renderCubes = () => {
    return Array.from({ length: gridSize }).map((_, x) =>
      Array.from({ length: gridSize }).map((_, z) => {
        const position = savedPositions?.[`${x}-${z}`] || [
          x * spacing - offset,
          0,
          z * spacing - offset
        ];
        
        return (
          <mesh 
            key={`${x}-${z}`} 
            position={position}
            onPointerUp={() => onSavePositions?.(x, z, position)}
          >
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
              map={baseColorMap}
              normalMap={normalMap}
              roughnessMap={roughnessMap}
              metalnessMap={metalnessMap}
              metalness={0.8}
              roughness={0.2}
              envMapIntensity={1}
            />
          </mesh>
        );
      })
    );
  };

  // Add useEffect for position logging
  useEffect(() => {
    if (groupRef.current) {
      console.log('===== POSITION LOGGING =====');
      console.log('Group children:', groupRef.current.children);
      groupRef.current.children.forEach((mesh, index) => {
        const x = Math.floor(index / 2);
        const z = index % 2;
        console.log(`Cube [${x},${z}] position:`, mesh.position.toArray());
      });
    }
  }, [groupRef.current]);

  if (isGroupMode) {
    return (
      <PivotControls
        anchor={[0, 0, 0]}
        scale={1}
        depthTest={false}
        activeAxes={[true, true, true]}
        lineWidth={4}
        axisColors={['#ff2060', '#20df80', '#2080ff']}
        hoveredColor="#ffff40"
        opacity={1}
      >
        <group ref={groupRef}>
          {renderCubes()}
        </group>
      </PivotControls>
    );
  }

  return (
    <group>
      {Array.from({ length: gridSize }).map((_, x) =>
        Array.from({ length: gridSize }).map((_, z) => {
          const position = savedPositions?.[`${x}-${z}`] || [
            x * spacing - offset,
            0,
            z * spacing - offset
          ];
          
          return (
            <PivotControls
              key={`${x}-${z}`}
              anchor={position}
              scale={1}
              depthTest={false}
              activeAxes={[true, true, true]}
              lineWidth={4}
              axisColors={['#ff2060', '#20df80', '#2080ff']}
              hoveredColor="#ffff40"
              opacity={1}
              onDragStart={onPivotStart}
              onDragEnd={(e) => {
                onPivotEnd(e);
                // Get the mesh from the pivot controls
                const mesh = e.object.children[0];
                if (mesh) {
                  // Get the local position of the mesh (relative to the pivot)
                  const newPosition = mesh.position.toArray();
                  console.log(`Saving individual cube position [${x},${z}]:`, newPosition);
                  onSavePositions?.(x, z, newPosition);
                }
              }}
            >
              <mesh position={position}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial
                  map={baseColorMap}
                  normalMap={normalMap}
                  roughnessMap={roughnessMap}
                  metalnessMap={metalnessMap}
                  metalness={0.8}
                  roughness={0.2}
                  envMapIntensity={1}
                />
              </mesh>
            </PivotControls>
          );
        })
      )}
    </group>
  );
}

function DragPreviewModel({ glbPath, position, visible }) {
  const gltf = useLoader(GLTFLoader, glbPath);
  return (
    <group position={position} visible={visible}>
      <primitive object={gltf.scene} dispose={null} />
    </group>
  );
}

function Drag3DPreview({ draggedAsset, isOverCanvas, setPreview3DPos, preview3DPos }) {
  const { camera, size, gl } = useThree();

  useEffect(() => {
    if (!draggedAsset || draggedAsset.type !== 'model' || !isOverCanvas) return;
    const handle = (e) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      setPreview3DPos([intersection.x, intersection.y, intersection.z]);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [draggedAsset, isOverCanvas, camera, gl, setPreview3DPos]);

  // Render preview model
  if (draggedAsset && draggedAsset.type === 'model' && isOverCanvas) {
    return (
      <group position={preview3DPos}>
        <DragPreviewModel
          glbPath={draggedAsset.path}
          position={[0, 0, 0]}
          visible={true}
        />
      </group>
    );
  }
  return null;
}

export default function MaterialViewer() {
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [isPivoting, setIsPivoting] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [savedPositions, setSavedPositions] = useState(() => {
    const saved = localStorage.getItem('cubePositions');
    return saved ? JSON.parse(saved) : null;
  });
  const groupRef = useRef();
  // Estado para drag visual del thumbnail
  const [draggedAsset, setDraggedAsset] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [preview3DPos, setPreview3DPos] = useState([0, 0, 0]);
  const [droppedModels, setDroppedModels] = useState([]); // [{ path, position }]
  const canvasRef = useRef();

  const cycleMaterial = () => {
    setCurrentMaterialIndex((prev) => (prev + 1) % materials.length);
  };

  const toggleGroupMode = () => {
    setIsGroupMode(prev => !prev);
  };

  // Use a direct approach for saving positions
  const onSavePositions = (positions) => {
    console.log('Directly setting positions:', positions);
    setSavedPositions(positions);
    localStorage.setItem('cubePositions', JSON.stringify(positions));
  };
  
  // On component mount, load positions once and set them directly
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem('cubePositions');
      if (savedPos) {
        const positions = JSON.parse(savedPos);
        console.log('Loaded positions from localStorage:', positions);
        setSavedPositions(positions);
      }
    } catch (e) {
      console.error('Error loading positions:', e);
    }
  }, []);
  
  // Simpler save button that directly sets state
  const savePositions = () => {
    if (isGroupMode && groupRef.current) {
      const positions = {};
      groupRef.current.children.forEach((mesh, index) => {
        const x = Math.floor(index / 2);
        const z = index % 2;
        positions[`${x}-${z}`] = mesh.position.toArray();
      });
      console.log('Directly saving group positions:', positions);
      setSavedPositions(positions);
      localStorage.setItem('cubePositions', JSON.stringify(positions));
    }
  };
  
  // Save positions on component unmount
  useEffect(() => {
    return () => {
      if (savedPositions) {
        console.log('Saving positions on unmount:', savedPositions);
        localStorage.setItem('cubePositions', JSON.stringify(savedPositions));
      }
    };
  }, [savedPositions]);

  const handleCubePositionChange = (x, z, position) => {
    console.log(`Position change for cube [${x},${z}]:`, position);
    setSavedPositions(prev => {
      const newPositions = { ...prev };
      newPositions[`${x}-${z}`] = position;
      console.log('Updated positions:', newPositions);
      return newPositions;
    });
  };

  const resetPositions = () => {
    console.log('Resetting positions');
    setSavedPositions(null);
    localStorage.removeItem('cubePositions');
  };

  // Handlers para drag visual
  const handleDragStart = (asset, e) => {
    e.preventDefault();
    setDraggedAsset(asset);
    setDragPosition({ x: e.clientX, y: e.clientY });
    document.body.style.userSelect = 'none';
  };

  const handleDrag = (e) => {
    if (draggedAsset) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = (e) => {
    // Si está sobre el canvas y es modelo, hacer drop
    if (isOverCanvas && draggedAsset && draggedAsset.type === 'model') {
      setDroppedModels((prev) => [
        ...prev,
        { path: draggedAsset.path, position: preview3DPos },
      ]);
    }
    setDraggedAsset(null);
    setIsOverCanvas(false);
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (draggedAsset) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggedAsset, isOverCanvas, preview3DPos]);

  // Handlers para detectar entrada/salida del mouse en el canvas
  const handlePointerEnter = () => {
    if (draggedAsset && draggedAsset.type === 'model') setIsOverCanvas(true);
  };
  const handlePointerLeave = () => {
    setIsOverCanvas(false);
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#ffffff', display: 'flex' }}>
      {/* Panel lateral de explorador de modelos */}
      <div style={{
        width: '220px',
        background: '#f5f5f5',
        borderRight: '1px solid #ddd',
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1100
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>Modelos</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {assets.map(asset => (
            <li
              key={asset.name}
              style={{
                marginBottom: '10px',
                padding: '8px 10px',
                background: '#fff',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                fontSize: '15px',
                color: '#222',
                cursor: 'grab',
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                userSelect: 'none',
              }}
              onMouseDown={(e) => handleDragStart(asset, e)}
            >
              <img
                src={asset.thumbnail}
                alt={asset.name}
                style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc', background: '#eee' }}
              />
              <span>{asset.name}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Drag visual del thumbnail */}
      {draggedAsset && !isOverCanvas && (
        <div
          style={{
            position: 'fixed',
            left: dragPosition.x + 8,
            top: dragPosition.y + 8,
            pointerEvents: 'none',
            zIndex: 2000,
            opacity: 0.85,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src={draggedAsset.thumbnail}
            alt={draggedAsset.name}
            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '2px solid #2196F3', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
          />
        </div>
      )}
      {/* Panel de controles y visor 3D */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={cycleMaterial}
              style={{
                padding: '12px 24px',
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '200px'
              }}
            >
              {`Current: ${materials[currentMaterialIndex].name}`}
            </button>
            <button
              onClick={toggleGroupMode}
              style={{
                padding: '12px 24px',
                backgroundColor: isGroupMode ? '#4CAF50' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s',
                minWidth: '150px'
              }}
            >
              {isGroupMode ? 'Individual Mode' : 'Group Mode'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={savePositions}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '150px'
              }}
            >
              Save Position
            </button>
            <button
              onClick={resetPositions}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '150px'
              }}
            >
              Reset Position
            </button>
          </div>
        </div>
        <Canvas
          ref={canvasRef}
          camera={{ position: [6, 6, 6], fov: 45 }}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.5} />
          <spotLight 
            position={[10, 10, 10]} 
            intensity={1}
            angle={0.5}
            penumbra={1}
          />
          <CubeGrid 
            materialIndex={currentMaterialIndex} 
            onPivotStart={() => setIsPivoting(true)}
            onPivotEnd={() => setIsPivoting(false)}
            isGroupMode={isGroupMode}
            savedPositions={savedPositions}
            onSavePositions={handleCubePositionChange}
            groupRef={groupRef}
          />
          {/* Modelos ya soltados */}
          {droppedModels.map((model, idx) => (
            <DragPreviewModel
              key={model.path + idx}
              glbPath={model.path}
              position={model.position}
              visible={true}
            />
          ))}
          {/* Preview 3D mientras arrastras */}
          <Drag3DPreview
            draggedAsset={draggedAsset}
            isOverCanvas={isOverCanvas}
            setPreview3DPos={setPreview3DPos}
            preview3DPos={preview3DPos}
          />
          <OrbitControls 
            minDistance={5}
            maxDistance={20}
            target={[0, 0, 0]}
            enabled={!isPivoting}
          />
          <Environment 
            preset="studio"
            intensity={1}
            blur={0.5}
          />
          <gridHelper args={[20, 20]} />
        </Canvas>
      </div>
    </div>
  );
} 