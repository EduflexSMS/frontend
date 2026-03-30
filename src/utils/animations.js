import { easeInOut } from "framer-motion";

// --- Easing Curves ---
// Custom cubic-bezier for a super smooth, "Apple-like" glide
export const EASE_GLIDE = [0.16, 1, 0.3, 1];
export const EASE_SNAPPY = [0.0, 0.0, 0.2, 1];

// --- Spring Presets ---
// 1. Fast, Snappy Spring (Buttons, Hover, Small items)
export const springFast = {
    type: "spring",
    stiffness: 700,
    damping: 25,
    mass: 0.5
};

// 2. Smooth, Elegant Spring (Modals, Large Cards)
export const springSmooth = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
};

// --- Variants ---

// 3. Page Transition (Ultra-smooth Glide with slight scale)
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.99,
        filter: 'blur(3px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.6,
            ease: EASE_GLIDE,
            staggerChildren: 0.05
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.99,
        filter: 'blur(3px)',
        transition: {
            duration: 0.4,
            ease: [0.32, 0, 0.67, 0]
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
            delayChildren: 0.05
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
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: springSmooth
    }
};

// 8. Hover Scale (Cards) - Snappier
export const hoverScale = {
    scale: 1.02,
    y: -5,
    boxShadow: "0px 15px 30px rgba(0,0,0,0.2)",
    transition: springFast
};

// 9. Tap Feedback
export const tapScale = {
    scale: 0.97,
    transition: springFast
};
