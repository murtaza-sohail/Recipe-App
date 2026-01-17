import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const HolographicCard = ({ children, className = '', style = {} }) => {
    const cardRef = useRef(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glowX, setGlowX] = useState(50);
    const [glowY, setGlowY] = useState(50);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -10;
        const rotateYValue = ((x - centerX) / centerX) * 10;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
        setGlowX((x / rect.width) * 100);
        setGlowY((y / rect.height) * 100);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setGlowX(50);
        setGlowY(50);
    };

    return (
        <motion.div
            ref={cardRef}
            className={`holographic-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.1s ease-out',
                position: 'relative',
                transformStyle: 'preserve-3d',
                ...style
            }}
            whileHover={{ scale: 1.02, z: 50 }}
        >
            {/* Holographic shine effect */}
            <div
                className="holographic-shine"
                style={{
                    background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0, 242, 254, 0.4), transparent 50%)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    borderRadius: 'inherit',
                    opacity: 0.5,
                    mixBlendMode: 'screen'
                }}
            />

            {/* Scanning line effect */}
            <div className="scan-line-effect" />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>

            <style jsx>{`
        .holographic-card {
          border: 1px solid rgba(0, 242, 254, 0.3);
          box-shadow: 
            0 0 20px rgba(0, 242, 254, 0.2),
            0 10px 40px rgba(0, 0, 0, 0.5),
            inset 0 0 20px rgba(0, 242, 254, 0.1);
          backdrop-filter: blur(10px);
          will-change: transform;
        }

        .holographic-card::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #ff0055, #00f2fe, #7000ff, #ff0055);
          background-size: 400% 400%;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: holographic-border 3s ease infinite;
        }

        .holographic-card:hover::before {
          opacity: 0.6;
        }

        .scan-line-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00f2fe, transparent);
          animation: scan 2s linear infinite;
          pointer-events: none;
          opacity: 0;
        }

        .holographic-card:hover .scan-line-effect {
          opacity: 0.7;
        }

        @keyframes holographic-border {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
        </motion.div>
    );
};

export default HolographicCard;
