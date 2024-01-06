import { motion } from 'framer-motion';

import { animateFadeIn } from '@/styling/animations';

import { CProps } from './props';

interface AnimateFadeInProps extends CProps.AnimatedDiv {}

function AnimateFadeIn({ children, ...restProps }: AnimateFadeInProps) {
  return (
    <motion.div
      initial={{ ...animateFadeIn.initial }}
      animate={{ ...animateFadeIn.animate }}
      exit={{ ...animateFadeIn.exit }}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}

export default AnimateFadeIn;
