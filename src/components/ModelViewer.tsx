// components/ModelViewer.jsx
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

const Model = () => {
  const gltf = useGLTF('/models/myModel.glb') // public folderdə saxla
  return <primitive object={gltf.scene} scale={1} />
}

const ModelViewer = () => {
  return (
    <div className="w-full h-[30%] mt-7">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} />
        <Suspense fallback={null}>
          <Model />
          <OrbitControls enableZoom={true} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default ModelViewer
