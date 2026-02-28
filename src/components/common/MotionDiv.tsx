'use client';

import { motion, HTMLMotionProps, ElementType } from 'framer-motion';

type MotionDivProps = HTMLMotionProps<any> & {
  tag?: ElementType;
  children: React.ReactNode;
};

// A helper component to use framer-motion's motion components in server components
export function MotionDiv({ tag = 'div', children, ...props }: MotionDivProps) {
  const MotionComponent = motion[tag as keyof typeof motion] || motion.div;
  return <MotionComponent {...props}>{children}</MotionComponent>;
}