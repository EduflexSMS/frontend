import { easeInOut } from "framer-motion";

// 1. Fast, Snappy Spring (For hover effects, small interactions)
export const springFast = {
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 0.5
};

// 2. Smooth, Elegant Spring (For page transitions, modal entries)
export const springSmooth = {
    type: "spring",
    stiffness: 250,
    damping: 25,
    mass: 1
};

// 3. Page Transition Variants
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1], // Custom cubic bezier for "Apple-like" feel
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: 'blur(5px)',
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

// 4. Stagger Container (For lists, grids)
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

// 5. Item Fade Up (Standard element entry)
export const itemFadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

// 6. Hover Scale (Standard card hover)
export const hoverScale = {
    scale: 1.03,
    y: -4,
    transition: springFast
};

// 7. Tap Feedback
export const tapScale = {
    scale: 0.96,
    transition: { duration: 0.1 }
};
