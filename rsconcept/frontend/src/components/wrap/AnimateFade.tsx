import { motion } from 'framer-motion';

import { animateFade } from '@/styling/animations';

import { CProps } from '../props';

interface AnimateFadeProps extends CProps.AnimatedDiv {
  noFadeIn?: boolean;
  noFadeOut?: boolean;
}

function AnimateFade({ noFadeIn, noFadeOut, children, ...restProps }: AnimateFadeProps) {
  return (
    <motion.div
      initial={{ ...(!noFadeIn ? animateFade.initial : {}) }}
      animate={{ ...animateFade.animate }}
      exit={{ ...(!noFadeOut ? animateFade.exit : {}) }}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}

export default AnimateFade;
