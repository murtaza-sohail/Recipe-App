import React from 'react';
import { motion } from 'framer-motion';

const CyberpunkBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            backgroundColor: '#050505',
            overflow: 'hidden'
        }}>
            {/* Grid Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                    linear-gradient(to right, rgba(0, 242, 254, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 242, 254, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                transform: 'perspective(500px) rotateX(60deg) scale(2.5)',
                transformOrigin: 'top'
            }} />

            {/* Glowing Orbs */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: ['0vw', '100vw', '0vw'],
                        y: ['0vh', '100vh', '0vh'],
                        scale: [1, 1.5, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 15 + i * 5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: i % 2 === 0 ? 'var(--primary-glow)' : 'var(--secondary-glow)',
                        filter: 'blur(100px)',
                        top: '-150px',
                        left: '-150px'
                    }}
                />
            ))}

            {/* Scanlines Effect */}
            <div className="scanline" />
            <div className="vignette" />
        </div>
    );
};

export default CyberpunkBackground;
