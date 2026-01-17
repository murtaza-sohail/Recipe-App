import React, { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Box, MeshDistortMaterial, Environment, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Floating geometric shape component
const FloatingShape = ({ position, geometry, speed = 1 }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.002 * speed;
            meshRef.current.rotation.y += 0.003 * speed;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.4;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            {geometry === 'sphere' && <Sphere args={[0.5, 32, 32]} />}
            {geometry === 'torus' && <Torus args={[0.5, 0.2, 16, 32]} />}
            {geometry === 'box' && <Box args={[0.8, 0.8, 0.8]} />}
            <MeshDistortMaterial
                color="#00f2fe"
                attach="material"
                distort={0.4}
                speed={1.5}
                roughness={0}
                metalness={1}
                emissive="#00f2fe"
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
            />
        </mesh>
    );
};

// Particle system optimized
const Particles = memo(() => {
    const count = 60; // Reduced count for better performance
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    const particles = useMemo(() => {
        const positions = [];
        for (let i = 0; i < count; i++) {
            positions.push([
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            ]);
        }
        return positions;
    }, [count]);

    return (
        <group ref={meshRef}>
            {particles.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <sphereGeometry args={[0.03, 4, 4]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#ff0055' : '#00f2fe'}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            ))}
        </group>
    );
});

// Holographic grid
const HolographicGrid = memo(() => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 - 5.1;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
            <planeGeometry args={[50, 50, 30, 30]} />
            <meshBasicMaterial
                color="#00f2fe"
                wireframe
                transparent
                opacity={0.12}
            />
        </mesh>
    );
});

// Rotating rings
const RotatingRing = ({ radius, speed, axis = 'y' }) => {
    const ringRef = useRef();

    useFrame(() => {
        if (ringRef.current) {
            if (axis === 'y') ringRef.current.rotation.y += 0.001 * speed;
            if (axis === 'x') ringRef.current.rotation.x += 0.001 * speed;
            if (axis === 'z') ringRef.current.rotation.z += 0.001 * speed;
        }
    });

    return (
        <mesh ref={ringRef}>
            <torusGeometry args={[radius, 0.05, 16, 100]} />
            <meshBasicMaterial
                color="#ff0055"
                transparent
                opacity={0.3}
            />
        </mesh>
    );
};

const HolographicBackground = () => {
    const [dpr, setDpr] = React.useState(1.5);
    const [perf, setPerf] = React.useState('high');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            backgroundColor: '#050505'
        }}>
            <Canvas
                dpr={dpr}
                camera={{ position: [0, 0, 10], fov: 75 }}
                gl={{ antialias: true, alpha: true }}
            >
                <PerformanceMonitor
                    onDecline={() => {
                        setPerf('low');
                        setDpr(1);
                    }}
                    onIncline={() => {
                        setPerf('high');
                        setDpr(1.5);
                    }}
                />
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ff0055" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#00f2fe" />
                <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={1} color="#7000ff" />

                {/* Holographic Grid */}
                <HolographicGrid />

                {/* Floating Shapes */}
                <FloatingShape position={[-4, 2, -3]} geometry="sphere" speed={1.2} />
                <FloatingShape position={[4, -1, -2]} geometry="torus" speed={0.8} />
                <FloatingShape position={[2, 3, -4]} geometry="box" speed={1} />
                <FloatingShape position={[-3, -2, -3]} geometry="sphere" speed={1.5} />
                <FloatingShape position={[0, 4, -5]} geometry="torus" speed={0.9} />

                {/* Rotating Rings */}
                <RotatingRing radius={8} speed={1} axis="y" />
                <RotatingRing radius={7} speed={-1.5} axis="x" />
                <RotatingRing radius={6.5} speed={2} axis="z" />

                {/* Particles */}
                <Particles />

                {/* Post-processing Effects */}
                <EffectComposer disableNormalPass multisampling={perf === 'high' ? 8 : 0}>
                    <Bloom
                        intensity={perf === 'high' ? 1.2 : 0.6}
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        blendFunction={BlendFunction.SCREEN}
                    />
                    {perf === 'high' && (
                        <ChromaticAberration
                            offset={[0.0015, 0.0015]}
                            blendFunction={BlendFunction.NORMAL}
                        />
                    )}
                </EffectComposer>
            </Canvas>

            {/* 2D Overlays */}
            <div className="scanline" />
            <div className="vignette" />
        </div>
    );
};

export default HolographicBackground;
