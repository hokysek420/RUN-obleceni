'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface MotionRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  viewportOnce?: boolean;
}

export default function MotionReveal({
  children,
  delay = 0,
  duration = 0.7,
  yOffset = 24,
  className = '',
  viewportOnce = true,
  ...props
}: MotionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: viewportOnce, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Luxury smooth cubic-bezier curve
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
