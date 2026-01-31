import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';

// ----------------------------------------------------------------------
// TECH CONSTELLATION COMPONENT
// ----------------------------------------------------------------------
// Creates floating particles that connect with lines when close to mouse
function ParticleNetwork({ color, count = 100 }) {
    const mesh = useRef();
    const linesMesh = useRef();
    const { viewport, mouse } = useThree();

    // 1. Create Particles
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3); // Store velocity for animation

        for (let i = 0; i < count; i++) {
            // Random positions spread across viewport
            positions[i * 3] = (Math.random() - 0.5) * viewport.width * 1.5;
            positions[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5; // Slight Z depth

            // Random velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.005;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
            velocities[i * 3 + 2] = 0;
        }
        return { positions, velocities };
    }, [count, viewport]);

    // Refs to hold live geometry data
    const particlesGeo = useRef();
    const linesGeo = useRef();

    useFrame((state) => {
        if (!particlesGeo.current || !linesGeo.current) return;

        const positions = particlesGeo.current.attributes.position.array;
        const velocities = particles.velocities;

        // --- ANIMATION LOOP ---
        for (let i = 0; i < count; i++) {
            // Move particles
            positions[i * 3] += velocities[i * 3];
            positions[i * 3 + 1] += velocities[i * 3 + 1];

            // Bounce off edges (keep within view mostly)
            if (Math.abs(positions[i * 3]) > viewport.width / 1.5) velocities[i * 3] *= -1;
            if (Math.abs(positions[i * 3 + 1]) > viewport.height / 1.5) velocities[i * 3 + 1] *= -1;
        }
        particlesGeo.current.attributes.position.needsUpdate = true;

        // --- INTERACTIVE LINES (MOUSE CONNECTION) ---
        // Convert mouse screen coords to 3D world coords roughly
        const mouseX = (mouse.x * viewport.width) / 2;
        const mouseY = (mouse.y * viewport.height) / 2;

        const linePositions = []; // To store pairs of points for lines
        const connectDistance = 3.5; // Max distance to connect
        const mouseConnectDistance = 4.0; // Distance to connect to mouse

        for (let i = 0; i < count; i++) {
            const px = positions[i * 3];
            const py = positions[i * 3 + 1];
            const pz = positions[i * 3 + 2];

            // Distance to mouse
            const dx = mouseX - px;
            const dy = mouseY - py;
            const distToMouse = Math.sqrt(dx * dx + dy * dy);

            // Connect to Mouse if close
            if (distToMouse < mouseConnectDistance) {
                linePositions.push(px, py, pz); // Start at particle
                linePositions.push(mouseX, mouseY, 0); // End at mouse
            }
        }

        // Update Lines Geometry
        linesGeo.current.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(linePositions, 3)
        );
    });

    return (
        <group>
            {/* The Particles (Dots) */}
            <points ref={mesh}>
                <bufferGeometry ref={particlesGeo}>
                    <bufferAttribute
                        attach="attributes-position"
                        count={count}
                        array={particles.positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.08} // Small sharp dots
                    color={color}
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                />
            </points>

            {/* The Connecting Lines */}
            <lineSegments ref={linesMesh}>
                <bufferGeometry ref={linesGeo} />
                <lineBasicMaterial
                    color={color}
                    transparent
                    opacity={0.2} // Faint lines
                    linewidth={1}
                />
            </lineSegments>
        </group>
    );
}

const Background3D = () => {
    const theme = useTheme();
    // V4 Colors
    const particleColor = '#3b82f6'; // Electric Blue

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none', // Allow clicks to pass through
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' // Deep Navy Gradient Base
        }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
                <ParticleNetwork color={particleColor} count={120} />
            </Canvas>
        </div>
    );
};

export default Background3D;
