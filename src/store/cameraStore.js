import { create } from 'zustand'

export const useCameraStore = create((set, get) => ({
  position: [10, 10, 10],
  rotation: [0, 0, 0],
  target: [0, 0, 0],
  isOrthographic: false,
  
  // Store camera state
  setCameraState: (position, rotation, target) => {
    console.log('Setting camera state:', { position, rotation, target }); // Debug log
    set({ position, rotation, target });
  },
  
  // Keep current position when toggling projection
  toggleProjection: () => {
    const currentState = get();
    // console.log('Toggle projection - Current state:', currentState); // Debug log
    
    set(state => ({
      isOrthographic: !state.isOrthographic,
      position: currentState.position,
      rotation: currentState.rotation,
      target: currentState.target
    }));
    
    // console.log('After toggle:', get()); // Debug log
  },
  
  resetPosition: () => 
    set({ position: [10, 10, 10], rotation: [0, 0, 0], target: [0, 0, 0] }),
})) 