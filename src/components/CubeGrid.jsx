import TexturedCube from './TexturedCube';

function CubeGrid({ setLoadingProgress, setCurrentResolution }) {
  const gridSize = 12; // Tamaño de la cuadrícula (10x10 = 100 cubos)
  const spacing = 1.2; // Espacio entre cubos

  return (
    <>
      {Array.from({ length: gridSize }).map((_, x) =>
        Array.from({ length: gridSize }).map((_, z) => (
          <TexturedCube
            key={`${x}-${z}`}
            name={`cubo-${x}-${z}`}
            position={[x * spacing - (gridSize * spacing) / 2, 0, z * spacing - (gridSize * spacing) / 2]}
            setLoadingProgress={setLoadingProgress}
            setCurrentResolution={setCurrentResolution}
          />
        ))
      )}
    </>
  );
}

export default CubeGrid; 