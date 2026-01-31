import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';

// Vertex Shader: Pass UVs to fragment
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader: Smooth shifting gradients
const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;

// Simplex noise function (simplified)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    // Slow down time
    float t = uTime * 0.2;
    
    // Create moving noise patterns
    float noise1 = snoise(vUv * 2.0 + t);
    float noise2 = snoise(vUv * 1.5 - t * 0.5);
    
    // Mix colors based on noise
    vec3 color = mix(uColor1, uColor2, noise1 * 0.5 + 0.5);
    color = mix(color, uColor3, noise2 * 0.5 + 0.5);
    
    // Add subtle vignette
    float dist = distance(vUv, vec2(0.5));
    color *= 1.0 - dist * 0.5;

    gl_FragColor = vec4(color, 1.0);
}
`;

function AuroraPlane({ colors }) {
    const mesh = useRef();

    // Prepare uniforms
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(colors[0]) },
            uColor2: { value: new THREE.Color(colors[1]) },
            uColor3: { value: new THREE.Color(colors[2]) },
        }),
        [colors] // Re-create uniforms only when colors change props
    );

    // Update logic
    useFrame((state) => {
        const { clock } = state;
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
            // Smoothly interpolate colors if they change (optional, but good for theme switch)
            mesh.current.material.uniforms.uColor1.value.lerp(new THREE.Color(colors[0]), 0.05);
            mesh.current.material.uniforms.uColor2.value.lerp(new THREE.Color(colors[1]), 0.05);
            mesh.current.material.uniforms.uColor3.value.lerp(new THREE.Color(colors[2]), 0.05);
        }
    });

    return (
        <mesh ref={mesh} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
}

const Background3D = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Elegant, subtle colors for "Aurora"
    // Dark: Deep Ocean Blue, Midnight Purple, Soft Teal
    // Light: Soft Grey, Pale Blue, Hint of Lavender
    const auroraColors = isDark
        ? ['#0f172a', '#1e1b4b', '#312e81'] // Deep, rich dark gradients
        : ['#f8fafc', '#ecfeff', '#f3e8ff']; // Very subtle light gradients

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none'
        }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <AuroraPlane colors={auroraColors} />
            </Canvas>
        </div>
    );
};

export default Background3D;
