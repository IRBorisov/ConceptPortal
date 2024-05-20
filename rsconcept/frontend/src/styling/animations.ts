/**
 * Module: animations parameters.
 */

import { Variants } from 'framer-motion';

/**
 * Duration constants in ms.
 */
export const animationDuration = {
  navigationToggle: 500
};

export const animateNavigation: Variants = {
  open: {
    height: '3rem',
    translateY: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: animationDuration.navigationToggle / 1000
    }
  },
  closed: {
    height: 0,
    translateY: '-1.5rem',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: animationDuration.navigationToggle / 1000
    }
  }
};

export const animateNavigationToggle: Variants = {
  on: {
    height: '3rem',
    width: '1.2rem',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: animationDuration.navigationToggle / 1000
    }
  },
  off: {
    height: '1.2rem',
    width: '3rem',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: animationDuration.navigationToggle / 1000
    }
  }
};

export const animateSlideLeft: Variants = {
  open: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.4,
      delayChildren: 0.2,
      staggerChildren: 0.05
    }
  },
  closed: {
    clipPath: 'inset(0% 100% 0% 0%)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3
    }
  }
};

export const animateHiddenHeader: Variants = {
  open: {
    translateX: 'calc(6.5rem - 50%)',
    marginLeft: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3
    }
  },
  closed: {
    translateX: 0,
    marginLeft: '0.75rem',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3
    }
  }
};

export const animateDropdown: Variants = {
  open: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.4,
      delayChildren: 0.2,
      staggerChildren: 0.05
    }
  },
  closed: {
    clipPath: 'inset(10% 0% 90% 0%)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3
    }
  }
};

export const animateDropdownItem: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      duration: 0.1,
      stiffness: 300,
      damping: 24
    }
  },
  closed: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.1
    }
  }
};

export const animateRSControl: Variants = {
  open: {
    clipPath: 'inset(0% 0% 0% 0%)',
    marginTop: '0.25rem',
    height: 'max-content',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.4
    }
  },
  closed: {
    clipPath: 'inset(0% 0% 100% 0%)',
    marginTop: '0',
    height: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3
    }
  }
};

export const animateParseResults: Variants = {
  open: {
    clipPath: 'inset(0% 0% 0% 0%)',
    marginTop: '0.75rem',
    padding: '0.25rem 0.5rem 0.25rem 0.5rem',
    borderWidth: '1px',
    height: '4.5rem',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.4
    }
  },
  closed: {
    clipPath: 'inset(0% 0% 100% 0%)',
    marginTop: '0',
    borderWidth: '0',
    padding: '0 0 0 0',
    height: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3
    }
  }
};

export const animateSideView = {
  initial: {
    clipPath: 'inset(0% 100% 0% 0%)'
  },
  animate: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 1
    }
  },
  exit: {
    clipPath: 'inset(0% 100% 0% 0%)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 1
    }
  }
};

export const animateSideAppear = {
  initial: {
    height: 0,
    opacity: 0
  },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.25
      },
      opacity: {
        delay: 0.25,
        duration: 0
      }
    }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.25
      },
      opacity: {
        duration: 0
      }
    }
  }
};

export const animateModal = {
  initial: {
    clipPath: 'inset(50% 50% 50% 50%)',
    opacity: 0
  },
  animate: {
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    clipPath: 'inset(50% 50% 50% 50%)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.2
    }
  }
};

export const animateFade = {
  initial: {
    opacity: 0
  },
  variants: {
    active: {
      opacity: 1,
      transition: {
        type: 'tween',
        ease: 'linear',
        duration: 0.4
      }
    },
    hidden: {
      opacity: 0,
      transition: {
        type: 'tween',
        ease: 'linear',
        duration: 0.4
      }
    }
  },
  exit: {
    opacity: 0,
    transition: {
      type: 'tween',
      ease: 'linear',
      duration: 0.4
    }
  }
};
