'use client'

/**
 * Pre-configured animated components for consistent animations
 */

import { motion, HTMLMotionProps } from 'framer-motion'
import {
  pageVariants,
  fadeInVariants,
  slideUpVariants,
  staggerContainerVariants,
  listItemVariants,
  metricCardVariants,
  chartVariants,
  tableRowVariants,
  cardHoverVariants,
  spring,
} from '@/lib/animations'

// Animated page wrapper
export function AnimatedPage({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Fade in wrapper
export function FadeIn({ children, delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Slide up wrapper
export function SlideUp({ children, delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      variants={slideUpVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger container for lists
export function StaggerContainer({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  )
}

// List item (use inside StaggerContainer)
export function StaggerItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={listItemVariants}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated metric card
export function AnimatedMetricCard({ children, index = 0, ...props }: HTMLMotionProps<'div'> & { index?: number }) {
  return (
    <motion.div
      variants={metricCardVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.05 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated chart wrapper
export function AnimatedChart({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={chartVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Table row animation
export function AnimatedTableRow({ children, index = 0, ...props }: HTMLMotionProps<'tr'> & { index?: number }) {
  return (
    <motion.tr
      variants={tableRowVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.02 }}
      {...props}
    >
      {children}
    </motion.tr>
  )
}

// Hoverable card with scale effect
export function HoverCard({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated number counter
export function AnimatedNumber({
  value,
  format = (n: number) => n.toLocaleString(),
  ...props
}: HTMLMotionProps<'span'> & {
  value: number
  format?: (n: number) => string
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {format(value)}
    </motion.span>
  )
}

// Skeleton loader
export function Skeleton({
  width,
  height = 20,
  ...props
}: HTMLMotionProps<'div'> & {
  width?: string | number
  height?: string | number
}) {
  return (
    <motion.div
      animate={{
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        width: width || '100%',
        height,
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '6px',
      }}
      {...props}
    />
  )
}

// Press-able button wrapper
export function PressButton({ children, ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={spring.snappy}
      {...props}
    >
      {children}
    </motion.button>
  )
}
