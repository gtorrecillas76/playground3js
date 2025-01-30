import React from 'react';
import { Grid } from '@react-three/drei';

function GridHelper() {
  return <Grid cellColor="white" args={[10, 10]} position={[0, -0.5, 0]} />;
}

export default GridHelper; 