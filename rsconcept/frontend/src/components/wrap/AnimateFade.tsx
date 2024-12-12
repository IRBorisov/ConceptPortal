'use client';

import { animated, useSpring } from '@react-spring/web';
import { useState } from 'react';

import { CProps } from '@/components/props';
import { PARAMETER } from '@/utils/constants';

interface AnimateFadeProps extends CProps.AnimatedDiv {
  noFadeIn?: boolean;
  noFadeOut?: boolean;
  hideContent?: boolean;
}

function AnimateFade({ style, noFadeIn, noFadeOut, hideContent, children, ...restProps }: AnimateFadeProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const springs = useSpring({
    config: { duration: PARAMETER.fadeDuration, clamp: true },
    from: { opacity: noFadeIn ? 1 : 0 },
    to: {
      opacity: hideContent ? 0 : 1,
      display: hideContent === undefined ? undefined : !isAnimating || (noFadeOut && hideContent) ? 'none' : 'block'
    },
    enter: { opacity: 0 },
    leave: { opacity: noFadeOut ? 1 : 0 },
    onStart: () => {
      if (!hideContent) setIsAnimating(true);
    },
    onRest: () => {
      if (hideContent) setIsAnimating(false);
    }
  });

  return (
    <animated.div tabIndex={-1} style={{ ...springs, ...style }} {...restProps}>
      {children}
    </animated.div>
  );
}

export default AnimateFade;
