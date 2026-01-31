import { easeInOut } from "framer-motion";

// --- Easing Curves ---
// "Snappy" ease out expo for premium feel
const EASE_SNAPPY = [0.16, 1, 0.3, 1];

// --- Spring Presets ---
// 1. Fast, Snappy Spring (Buttons, Hover, Small items)
export const springFast = {
    type: "spring",
    stiffness: 600, // Hyper-fast
    damping: 25,
    mass: 0.4
};

// 2. Smooth, Elegant Spring (Modals, Large Cards)
export const springSmooth = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
};

// --- Variants ---

// 3. Page Transition (Faster, crisper)
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 8, // Reduced movement
        scale: 0.99
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.2, // Hyper-Speed
            ease: EASE_SNAPPY
        }
    },
    exit: {
        opacity: 0,
        y: -8,
        filter: 'blur(2px)',
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    }
};

// 4. Stagger Container (Fast listing)
export const containerStagger = (staggerDelay = 0.03) => ({
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
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: EASE_SNAPPY
        }
    }
};

// 6. Simple Fade In (Text, details)
export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2, ease: "easeOut" }
    }
};

// 7. Slide Up (Cards, Sections)
export const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 30
        }
    }
};

// 8. Hover Scale (Cards)
export const hoverScale = {
    scale: 1.02,
    y: -2,
    transition: { duration: 0.15, ease: "easeOut" } // Instant feeling
};

// 9. Tap Feedback
export const tapScale = {
    scale: 0.97,
    transition: { duration: 0.05 }
};

