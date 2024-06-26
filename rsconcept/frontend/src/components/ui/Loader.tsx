'use client';

import { ThreeCircles, ThreeDots } from 'react-loader-spinner';

import { useConceptOptions } from '@/context/ConceptOptionsContext';

import AnimateFade from '../wrap/AnimateFade';

interface LoaderProps {
  size?: number;
  circular?: boolean;
}

function Loader({ size = 10, circular }: LoaderProps) {
  const { colors } = useConceptOptions();
  return (
    <AnimateFade noFadeIn className='flex justify-center'>
      {circular ? (
        <ThreeCircles color={colors.bgPrimary} height={size * 10} width={size * 10} />
      ) : (
        <ThreeDots color={colors.bgPrimary} height={size * 10} width={size * 10} radius={size} />
      )}
    </AnimateFade>
  );
}

export default Loader;
