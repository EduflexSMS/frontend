import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';

// ----------------------------------------------------------------------
// HOLOGRAPHIC GEOMETRY COMPONENT
// ----------------------------------------------------------------------

function Hologram({ geometry, position, color, speed = 1 }) {
    const mesh = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Complex rotation for "floating" feel
        mesh.current.rotation.x = time * 0.2 * speed;
        mesh.current.rotation.y = time * 0.3 * speed;
        // Subtle breathing effect
        const scale = 1 + Math.sin(time * 0.5) * 0.05;
        mesh.current.scale.set(scale, scale, scale);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={mesh} position={position}>
                {geometry}
                {/* Wireframe Material for Hologram Look */}
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    wireframe={true}
                    transparent
                    opacity={0.3}
                    roughness={0}
                    metalness={1}
                />
            </mesh>
            {/* Inner Glow Mesh (Solid but transparent) */}
            <mesh position={position} scale={[0.9, 0.9, 0.9]}>
                {geometry}
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.05}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </Float>
    );
}

const Background3D = () => {
    const theme = useTheme();
    // V5 Holographic Colors
    const color1 = '#06b6d4'; // Cyan
    const color2 = '#d946ef'; // Magenta
    const color3 = '#8b5cf6'; // Violet

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)' // Deep Nebula CSS Background
        }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Floating Shapes */}
                <Hologram
                    geometry={<torusKnotGeometry args={[1, 0.3, 128, 16]} />}
                    position={[-5, 2, -5]}
                    color={color1}
                    speed={0.8}
                />

                <Hologram
                    geometry={<icosahedronGeometry args={[2, 0]} />}
                    position={[6, -3, -2]}
                    color={color2}
                    speed={0.6}
                />

                <Hologram
                    geometry={<octahedronGeometry args={[1.5, 0]} />}
                    position={[0, 4, -8]}
                    color={color3}
                    speed={0.5}
                />

                <Hologram
                    geometry={<torusGeometry args={[3, 0.2, 16, 100]} />}
                    position={[0, 0, -10]}
                    color="#3b82f6"
                    speed={0.2}
                />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default Background3D;
