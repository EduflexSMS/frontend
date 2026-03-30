import { easeInOut } from "framer-motion";

// --- Easing Curves ---
// Custom cubic-bezier for a super smooth, "Apple-like" glide
export const EASE_GLIDE = [0.16, 1, 0.3, 1];
export const EASE_SNAPPY = [0.0, 0.0, 0.2, 1];

// --- Spring Presets ---
// 1. Ultra-snappy Spring (Buttons, Hover, Small items) - Instant, glassy feel
export const springFast = {
    type: "spring",
    damping: 15,
    stiffness: 400,
    mass: 0.6
};

// 2. Elegant, Deep Spring (Modals, Large Cards, Routes) - Liquid glide
export const springSmooth = {
    type: "spring",
    damping: 24,
    stiffness: 200,
    mass: 0.8
};

// --- Variants ---

// 3. Page Transition (Premium Depth-Scale & Zoom Fade)
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 15, // Slight upward drift
        scale: 0.95, // Deep back distance
        filter: 'blur(8px)',
        transformOrigin: "center center"
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1, // Snap forward exactly to screen
        filter: 'blur(0px)',
        transition: {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1], // Apple glide
            staggerChildren: 0.08
        }
    },
    exit: {
        opacity: 0,
        y: -10, // Drift up away
        scale: 1.05, // Slight zoom toward the user when exiting
        filter: 'blur(10px)',
        transition: {
            duration: 0.4,
            ease: [0.32, 0, 0.67, 0] // Snappy shrink
        }
    }
};

export const slideInRight = {
    initial: { opacity: 0, x: 40, filter: 'blur(3px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_GLIDE } },
    exit: { opacity: 0, x: -40, filter: 'blur(3px)', transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] } }
};

export const slideInLeft = {
    initial: { opacity: 0, x: -40, filter: 'blur(3px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_GLIDE } },
    exit: { opacity: 0, x: 40, filter: 'blur(3px)', transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] } }
};

// 4. Stagger Container
export const containerStagger = (staggerDelay = 0.06) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.08,
            ease: EASE_GLIDE
        }
    }
});

// 5. Item Fade Up (Standard list item)
export const itemFadeUp = {
    hidden: { opacity: 0, y: 20, scale: 0.97, filter: 'blur(2px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.5,
            ease: EASE_GLIDE
        }
    }
};

// 6. Simple Fade In
export const fadeIn = {
    hidden: { opacity: 0, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: EASE_GLIDE }
    }
};

// 7. Slide Up (Cards, Sections)
export const slideUp = {
    hidden: { opacity: 0, y: 30, scale: 0.98, filter: 'blur(5px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: springSmooth
    }
};

// 8. Hover Scale (Cards) - Crystal liquid pop
export const hoverScale = {
    scale: 1.03,
    y: -6,
    boxShadow: "0px 25px 50px rgba(0,0,0,0.15)",
    transition: springFast
};

// 9. Tap Feedback
export const tapScale = {
    scale: 0.96,
    transition: springFast
};
