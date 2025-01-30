import React from 'react';

function LoadingOverlay({ loadingProgress, currentResolution }) {
  return (
    loadingProgress < 100 && (
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
    )
  );
}

export default LoadingOverlay; 