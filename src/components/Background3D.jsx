import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useTheme } from '@mui/material/styles';

function FloatingParticles({ count = 100, color }) {
    const mesh = useRef();
    const lightColor = useMemo(() => color, [color]);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        // Iterate through particles and update positions
        // Note: instanced mesh would be better for performance with high counts, 
        // but for simple floating circles, simple mesh iteration or points is okay.
        // For "modern 3D", let's actually just rotate the whole group or use Points.

        // Actually, let's keep it simple: Just rotate the entire group slowly
        mesh.current.rotation.x = state.clock.getElapsedTime() * 0.05;
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    });

    return (
        <group ref={mesh}>
            {/* Use simple scattered spheres for "floating items" */}
            {particles.map((data, i) => (
                <mesh key={i} position={[data.xFactor, data.yFactor, data.zFactor]}>
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshBasicMaterial color={lightColor} transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
}

const Background3D = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
            opacity: 0.6,
            background: isDark
                ? 'radial-gradient(circle at 50% 50%, #111827 0%, #030712 100%)'
                : 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)'
        }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={1}
                />
                <FloatingParticles
                    count={150}
                    color={isDark ? '#4f46e5' : '#3b82f6'}
                />
            </Canvas>
        </div>
    );
};

export default Background3D;
