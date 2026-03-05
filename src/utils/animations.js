import { easeInOut } from "framer-motion";

// --- Easing Curves ---
const EASE_SNAPPY = [0.16, 1, 0.3, 1];

// --- Spring Presets ---
export const springFast = {
    type: "spring",
    stiffness: 800,
    damping: 20,
    mass: 0.2
};

export const springSmooth = {
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 0.5
};

// --- Variants ---
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 5,
        scale: 0.99
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.1,
            ease: EASE_SNAPPY
        }
    },
    exit: {
        opacity: 0,
        y: -5,
        filter: 'blur(2px)',
        transition: {
            duration: 0.1,
            ease: "easeInOut"
        }
    }
};

export const containerStagger = (staggerDelay = 0.02) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.02
        }
    }
});

export const itemFadeUp = {
    hidden: { opacity: 0, y: 5 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.15,
            ease: EASE_SNAPPY
        }
    }
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.1, ease: "easeOut" }
    }
};

export const slideUp = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 600,
            damping: 25
        }
    }
};

export const hoverScale = {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.1, ease: "easeOut" }
};

export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.03 }
};
