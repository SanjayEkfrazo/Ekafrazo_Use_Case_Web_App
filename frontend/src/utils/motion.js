export const motionTokens = {
  ease: [0.22, 1, 0.36, 1],
  fast: 0.2,
  standard: 0.32,
  emphasized: 0.46,
  stagger: 0.1,
  spring: {
    type: "spring",
    stiffness: 260,
    damping: 24,
    mass: 0.9,
  },
};

export const pageMotion = {
  initial: { opacity: 0, scale: 0.985, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.emphasized,
      ease: motionTokens.ease,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.992,
    filter: "blur(4px)",
    transition: {
      duration: motionTokens.standard,
      ease: motionTokens.ease,
    },
  },
};

export const softScaleIn = {
  initial: { opacity: 0, scale: 0.92, y: 14 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...motionTokens.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: {
      duration: motionTokens.fast,
      ease: motionTokens.ease,
    },
  },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: motionTokens.stagger,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: motionTokens.standard,
      ease: motionTokens.ease,
    },
  },
};