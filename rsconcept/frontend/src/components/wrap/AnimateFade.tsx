import { motion } from 'framer-motion';

import { animateFade } from '@/styling/animations';

import { CProps } from '../props';

interface AnimateFadeProps extends CProps.AnimatedDiv {
  noFadeIn?: boolean;
  noFadeOut?: boolean;
  removeContent?: boolean;
  hideContent?: boolean;
}

function AnimateFade({
  style,
  noFadeIn,
  noFadeOut,
  children,
  removeContent,
  hideContent,
  ...restProps
}: AnimateFadeProps) {
  if (removeContent) {
    return null;
  }
  return (
    <motion.div
      initial={{ ...(!noFadeIn ? animateFade.initial : {}) }}
      animate={hideContent ? 'hidden' : 'active'}
      variants={animateFade.variants}
      exit={{ ...(!noFadeOut ? animateFade.exit : {}) }}
      style={{ display: hideContent ? 'none' : '', ...style }}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}

export default AnimateFade;
