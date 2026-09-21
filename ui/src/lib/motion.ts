import type { Transition, Variants } from 'framer-motion';

export const easeCyber = [0.16, 1, 0.3, 1] as const;

/** @deprecated use easeCyber */
export const easePremium = easeCyber;

/** Global spring — buttery first-screen physics */
export const springManifest = {
  type: 'spring' as const,
  stiffness: 40,
  damping: 12,
  mass: 1,
};

/** @deprecated use springManifest */
export const springHero = springManifest;

export const transitionCyber: Transition = {
  duration: 0.6,
  ease: easeCyber,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: springManifest,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springManifest,
      delay: i * 0.08,
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

export const heroSpringItem: Variants = {
  hidden: {
    opacity: 0,
    rotateY: -16,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: springManifest,
  },
};

/** @deprecated use heroSpringItem */
export const heroItem: Variants = heroSpringItem;

export const heroTitleSpring: Variants = {
  hidden: {
    opacity: 0,
    rotateY: -20,
    scale: 0.85,
  },
  visible: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: springManifest,
  },
};

export const hoverLift = {
  whileHover: { y: -4, scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: springManifest,
};

export const cardHover = {
  whileHover: { y: -6 },
  transition: springManifest,
};
