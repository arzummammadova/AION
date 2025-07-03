// components/ModelBackgroundLayout.jsx
import React from 'react'
import ModelViewer from './ModelViewer'

const ModelBackgroundLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* 3D Model fixed background */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <ModelViewer />
      </div>

      {/* Main Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default ModelBackgroundLayout
