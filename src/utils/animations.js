import { easeInOut } from "framer-motion";

// --- Easing Curves ---
// "Gliding" ease out for a luxurious, premium feel
const EASE_GLIDE = [0.23, 1, 0.32, 1];
const EASE_SNAPPY = [0.16, 1, 0.3, 1];

// --- Spring Presets ---
// 1. Fast, Snappy Spring (Buttons, Hover, Small items)
export const springFast = {
    type: "spring",
    stiffness: 600,
    damping: 30, // Increased damping for less "bounce"
    mass: 0.5
};

// 2. Smooth, Elegant Spring (Modals, Large Cards)
export const springSmooth = {
    type: "spring",
    stiffness: 250, // Slightly softer
    damping: 28,
    mass: 1
};

// --- Variants ---

// 3. Page Transition (Smoother, "Gliding")
export const pageVariants = {
    initial: {
        opacity: 0,
        x: 15, // Slide from right
        filter: 'blur(4px)',
    },
    animate: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.5, // Increased duration for "glide"
            ease: EASE_GLIDE,
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        x: -15, // Slide to left
        filter: 'blur(4px)',
        transition: {
            duration: 0.4,
            ease: "easeInOut"
        }
    }
};

// 4. Stagger Container
export const containerStagger = (staggerDelay = 0.05) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
        }
    }
});

// 5. Item Fade Up (Standard list item)
export const itemFadeUp = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: EASE_GLIDE
        }
    }
};

// 6. Simple Fade In
export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

// 7. Slide Up (Cards, Sections)
export const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
        }
    }
};

// 8. Hover Scale (Cards) - More subtle
export const hoverScale = {
    scale: 1.015,
    y: -4,
    transition: { duration: 0.3, ease: EASE_GLIDE }
};

// 9. Tap Feedback
export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 }
};

