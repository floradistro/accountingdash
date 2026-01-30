/**
 * Animation configurations for Framer Motion
 * Enterprise-grade, smooth, elegant transitions
 */

import { Variants } from 'framer-motion'

// Spring configurations for different use cases
export const spring = {
  // Smooth, elegant spring for general use
  smooth: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 0.8,
  },
  // Snappy spring for buttons and interactions
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  // Gentle spring for large elements
  gentle: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 15,
    mass: 1,
  },
  // Bouncy spring for playful interactions
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
    mass: 0.5,
  },
}

// Easing functions for non-spring animations
export const easing = {
  easeInOut: [0.45, 0, 0.55, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
}

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: easing.easeIn,
    },
  },
}

// Fade in variants
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

// Scale fade variants (for modals, popovers)
export const scaleFadeVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: easing.easeIn,
    },
  },
}

// Slide up variants (for bottom sheets, notifications)
export const slideUpVariants: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: spring.smooth,
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

// List item stagger variants
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -8,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
}

// Container for staggered children
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    transition: spring.snappy,
  },
  tap: {
    scale: 0.98,
    transition: spring.snappy,
  },
}

// Metric card variants (subtle animation)
export const metricCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
}

// Number counter animation helper
export const numberCounterTransition = {
  duration: 0.8,
  ease: easing.easeOut,
}

// Loading skeleton pulse
export const skeletonPulseVariants: Variants = {
  initial: {
    opacity: 0.3,
  },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easing.easeInOut,
    },
  },
}

// Chart entrance animation
export const chartVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easing.easeOut,
      delay: 0.2,
    },
  },
}

// Button press animation
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: spring.snappy,
  },
  tap: {
    scale: 0.95,
    transition: spring.snappy,
  },
}

// Notification slide in from top
export const notificationVariants: Variants = {
  initial: {
    y: -100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: spring.smooth,
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

// Drawer slide in from side
export const drawerVariants: Variants = {
  initial: {
    x: '100%',
  },
  animate: {
    x: 0,
    transition: spring.smooth,
  },
  exit: {
    x: '100%',
    transition: spring.gentle,
  },
}

// Table row stagger
export const tableRowVariants: Variants = {
  initial: {
    opacity: 0,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
}

// Badge pop-in
export const badgeVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: spring.bouncy,
  },
}

// Tooltip variants
export const tooltipVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 4,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 4,
    transition: {
      duration: 0.1,
    },
  },
}
