export const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

export const cardVariant = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }
};

export const modalVariant = {
  initial: { opacity: 0, scale: 0.94, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.2 } }
};

export const drawerVariant = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
  exit: { x: "100%", transition: { duration: 0.25 } }
};
