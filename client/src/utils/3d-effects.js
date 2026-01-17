// 3D utility functions for the Tony Stark AI interface

/**
 * Calculate 3D tilt values based on mouse position
 * @param {number} mouseX - Mouse X position
 * @param {number} mouseY - Mouse Y position
 * @param {DOMRect} rect - Element bounding rect
 * @param {number} intensity - Tilt intensity (default: 10)
 * @returns {{rotateX: number, rotateY: number}}
 */
export const calculate3DTilt = (mouseX, mouseY, rect, intensity = 10) => {
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    return { rotateX, rotateY };
};

/**
 * Check if WebGL is supported
 * @returns {boolean}
 */
export const isWebGLSupported = () => {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch (e) {
        return false;
    }
};

/**
 * Get performance tier for optimal 3D settings
 * @returns {'high' | 'medium' | 'low'}
 */
export const getPerformanceTier = () => {
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;

    // Check device memory (if available)
    const memory = navigator.deviceMemory || 4;

    // Determine tier
    if (cores >= 8 && memory >= 8) return 'high';
    if (cores >= 4 && memory >= 4) return 'medium';
    return 'low';
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function}
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Generate holographic gradient based on position
 * @param {number} x - X position (0-100)
 * @param {number} y - Y position (0-100)
 * @returns {string} CSS gradient string
 */
export const generateHolographicGradient = (x, y) => {
    return `radial-gradient(circle at ${x}% ${y}%, 
    rgba(0, 242, 254, 0.4) 0%, 
    rgba(255, 0, 85, 0.2) 50%, 
    transparent 70%)`;
};

/**
 * Create random particle positions for 3D space
 * @param {number} count - Number of particles
 * @param {number} spread - Spread distance
 * @returns {Array<[number, number, number]>}
 */
export const generateParticlePositions = (count, spread = 20) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
        positions.push([
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
        ]);
    }
    return positions;
};

/**
 * Calculate responsive 3D settings based on window size
 * @returns {{particleCount: number, quality: string}}
 */
export const getResponsive3DSettings = () => {
    const width = window.innerWidth;

    if (width < 768) {
        return { particleCount: 50, quality: 'low' };
    } else if (width < 1200) {
        return { particleCount: 75, quality: 'medium' };
    } else {
        return { particleCount: 100, quality: 'high' };
    }
};

export default {
    calculate3DTilt,
    isWebGLSupported,
    getPerformanceTier,
    throttle,
    generateHolographicGradient,
    generateParticlePositions,
    getResponsive3DSettings
};
