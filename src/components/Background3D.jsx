import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { useTheme } from '@mui/material/styles';

function MorphingBlob({ position, color, speed, distort, scale }) {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere args={[1, 64, 64]} position={position} scale={scale}>
                <MeshDistortMaterial
                    color={color}
                    envMapIntensity={0.4}
                    clearcoat={0.8}
                    clearcoatRoughness={0}
                    metalness={0.1}
                    distort={distort}
                    speed={speed}
                />
            </Sphere>
        </Float>
    );
}

const Background3D = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Dynamic colors based on theme
    const colors = isDark
        ? { primary: '#4338ca', secondary: '#be185d', accent: '#0f766e' } // Deep indigo, pink, teal
        : { primary: '#bfdbfe', secondary: '#fbcfe8', accent: '#99f6e4' }; // Pastels for light mode

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
            background: isDark
                ? 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' // Dark Slate
                : 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)',
            overflow: 'hidden'
        }}>
            <Canvas camera={{ position: [0, 0, 8] }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color={isDark ? "#818cf8" : "#ffffff"} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color={colors.secondary} />

                {/* Main huge morphing blob */}
                <MorphingBlob
                    position={[3, 0, -2]}
                    scale={2.5}
                    color={colors.primary}
                    distort={0.4}
                    speed={2}
                />

                {/* Secondary blobs */}
                <MorphingBlob
                    position={[-3, 2, -3]}
                    scale={1.8}
                    color={colors.secondary}
                    distort={0.5}
                    speed={3}
                />

                <MorphingBlob
                    position={[-1, -2, -1]}
                    scale={1.2}
                    color={colors.accent}
                    distort={0.3}
                    speed={1.5}
                />

                <Stars
                    radius={50}
                    depth={50}
                    count={isDark ? 3000 : 500}
                    factor={4}
                    saturation={0}
                    fade
                    speed={1}
                />
            </Canvas>
        </div>
    );
};

export default Background3D;
