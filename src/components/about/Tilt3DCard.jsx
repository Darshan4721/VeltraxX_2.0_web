// src/components/about/Tilt3DCard.jsx
// High-tactile Neo-Brutalist 3D cursor-tracking card wrapper
// Real Z-axis depth and spring physics without layout jitter

import React, { useRef, useState, useCallback } from 'react';

export default function Tilt3DCard({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  translateZ = 24,
  style = {},
  onClick,
  as: Component = 'div',
  ...rest
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    translateZ: 0,
    scale: 1,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;

      const rotX = -yPct * (maxTilt * 2);
      const rotY = xPct * (maxTilt * 2);

      setTransform({
        rotateX: rotX,
        rotateY: rotY,
        translateZ: translateZ,
        scale: scale,
      });
    },
    [maxTilt, scale, translateZ]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      scale: 1,
    });
  };

  return (
    <Component
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative [perspective:1000px] ${className}`}
      style={{
        ...style,
      }}
      {...rest}
    >
      <div
        className="w-full h-full [transform-style:preserve-3d] will-change-transform"
        style={{
          transform: isHovered
            ? `rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg) translateZ(${transform.translateZ}px) scale(${transform.scale})`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
          transition: isHovered
            ? 'transform 0.12s ease-out'
            : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {children}
      </div>
    </Component>
  );
}

