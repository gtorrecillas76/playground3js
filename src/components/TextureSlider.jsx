// Import store if needed for texture position
import { useTextureStore } from '../store/textureStore';

function TextureSlider() {
  const { textureOffset, setTextureOffset } = useTextureStore();

  const handleSliderChange = (e) => {
    setTextureOffset(parseFloat(e.target.value));
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      zIndex: 1,
      background: 'rgba(0,0,0,0.7)',
      padding: '10px',
      borderRadius: '5px',
      color: 'white'
    }}>
      <label>
        Posición de Textura: {textureOffset.toFixed(2)}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={textureOffset}
          onChange={handleSliderChange}
          style={{ width: '200px', marginLeft: '10px' }}
        />
      </label>
    </div>
  );
}

export default TextureSlider; 