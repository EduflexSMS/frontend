import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';

// ----------------------------------------------------------------------
// HOLOGRAPHIC GEOMETRY COMPONENT
// ----------------------------------------------------------------------

const Background3D = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)', // Deep Crystal Blue
            overflow: 'hidden'
        }}>
            {/* Simple Crystal Grid / Noise Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            {/* Subtle Animated Orbs (CSS Animation is faster/lighter than Three.js for simple needs) */}
            <div className="crystal-orb orb-1" />
            <div className="crystal-orb orb-2" />

            <style>{`
                .crystal-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                    animation: float 10s infinite ease-in-out;
                }
                .orb-1 {
                    width: 300px;
                    height: 300px;
                    background: #3b82f6;
                    top: -10%;
                    left: -10%;
                    animation-duration: 8s;
                }
                .orb-2 {
                    width: 400px;
                    height: 400px;
                    background: #8b5cf6;
                    bottom: -10%;
                    right: -10%;
                    animation-duration: 12s;
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, 50px); }
                }
            `}</style>
        </div>
    );
};

export default Background3D;


