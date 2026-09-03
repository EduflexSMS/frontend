// --- Easing Curves ---
// Snappy, silky-smooth 60-120 FPS transitions
export const EASE_GLIDE = [0.16, 1, 0.3, 1];
export const EASE_SNAPPY = [0.2, 0.0, 0, 1];

// --- Spring Presets ---
export const springFast = {
    type: "spring",
    damping: 20,
    stiffness: 350,
    mass: 0.5
};

export const springSmooth = {
    type: "spring",
    damping: 25,
    stiffness: 220,
    mass: 0.7
};

// --- Page & Component Variants ---
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 6,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.22,
            ease: EASE_GLIDE
        }
    },
    exit: {
        opacity: 0,
        y: -4,
        transition: {
            duration: 0.15,
            ease: EASE_SNAPPY
        }
    }
};

export const slideInRight = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: EASE_GLIDE } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.15, ease: EASE_SNAPPY } }
};

export const slideInLeft = {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: EASE_GLIDE } },
    exit: { opacity: 0, x: 16, transition: { duration: 0.15, ease: EASE_SNAPPY } }
};

// Stagger Container
export const containerStagger = (staggerDelay = 0.04) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.02,
            ease: EASE_GLIDE
        }
    }
});

// Item Fade Up
export const itemFadeUp = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: EASE_GLIDE
        }
    }
};

// Simple Fade In
export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2, ease: EASE_GLIDE }
    }
};

// Slide Up
export const slideUp = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: EASE_GLIDE }
    }
};

// Hover Scale (Cards) - Crisp & responsive
export const hoverScale = {
    scale: 1.015,
    y: -2,
    transition: springFast
};

// Tap Feedback
export const tapScale = {
    scale: 0.98,
    transition: springFast
};
