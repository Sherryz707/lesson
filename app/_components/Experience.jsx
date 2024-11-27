"use client"
import { useAppContext } from "../store"
import { useEffect, useRef, useState, useCallback, useReducer, Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from 'leva';
import { CameraControls, ContactShadows, Environment, Loader,Html,useGLTF,Gltf } from "@react-three/drei";
import Avatar from "./Avatar"
const CameraManager = ({ cameraControls }) => {
  const handleRef = useCallback((node) => {
    if (node !== null) {
      console.log("node",node)
      // cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0);
    }
  }, [cameraControls]);

  return (
    <CameraControls
      ref={handleRef} // Use the callback ref
      minZoom={1}
      maxZoom={30.3}
      mouseButtons={{
        left: 1, // ACTION.ROTATE
        wheel: 16 // ACTION.ZOOM
      }}
      touches={{
        one: 32, // ACTION.TOUCH_ROTATE
        two: 512 // ACTION.TOUCH_ZOOM
      }}
    />
  );
};
function Experience() {
    const { state, dispatch } = useAppContext()
    const cameraControls=useRef(null)
    console.log("my state", state)
    let { avatarPosition, avatarRotationY } = useControls({
    avatarPosition: { value: [-0.2, -2.2, -1.7], min: -5, max: 5, step: 0.1 },
    avatarRotationY: { value: 0, min: 0, max: 360, step: 1 } // Rotation control around Y-axis
  });
    return (
        
         <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Environment preset="sunset" />
          <CameraManager cameraControls={cameraControls} /> {/* Pass the ref down */}
          <Gltf
              src={`/models/classroom_default.glb`}
              position={[-0.2, -2.2, -1.1]}
            />
          {<Suspense fallback={<Html><p>LOADING MODEL</p></Html>}>
            
            
            <Avatar key={`lesson-${state.currentLessonIndex}-&-$`} // Unique key for re-rendering
              scale={1.5} position={avatarPosition} rotation-y={avatarRotationY * Math.PI / 180}
            />
          </Suspense>}
            </Canvas>
    )
}

export default Experience
useGLTF.preload("/models/classroom_default.glb");