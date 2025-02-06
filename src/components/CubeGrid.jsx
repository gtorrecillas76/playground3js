import TexturedCube from './TexturedCube';
import { useTextureStore } from '../store/textureStore';

function CubeGrid({ setLoadingProgress, setCurrentResolution }) {
  const gridSize = 2; // Tamaño de la cuadrícula (2x2 = 4 cubos)
  const spacing = 1.08; // Espacio entre cubos (1 unidad = 1 celda del grid)
  const { textureOffset } = useTextureStore();

  // Calculamos el offset para centrar la cuadrícula
  const offset = (gridSize - 1) / 2;

  return (
    <>
      {Array.from({ length: gridSize }).map((_, x) =>
        Array.from({ length: gridSize }).map((_, z) => (
          <TexturedCube
            key={`${x}-${z}`}
            name={`cubo-${x}-${z}`}
            position={[
              x * spacing - offset,
              0,
              z * spacing - offset
            ]}
            setLoadingProgress={setLoadingProgress}
            setCurrentResolution={setCurrentResolution}
          />
        ))
      )}
    </>
  );
}

export default CubeGrid;