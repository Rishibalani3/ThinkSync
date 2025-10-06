
export const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  in: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] 
    }
  },
  out: { 
    opacity: 0, 
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 10,
    scale: 0.99
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    scale: 1.005,
    y: -2,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const modalVariants = {
  initial: { 
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};


export const transitions = {
  smooth: {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94]
  },
  fast: {
    duration: 0.15,
    ease: [0.25, 0.46, 0.45, 0.94]
  },
  slow: {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94]
  }
};

export const motionProps = {
  style: {
    willChange: 'transform, opacity'
  },
  variants: cardVariants,
  initial: "initial",
  animate: "animate",
  whileHover: "hover"
};
