'use client';

import { ThreeCircles, ThreeDots } from 'react-loader-spinner';

import { useConceptOptions } from '@/context/ConceptOptionsContext';

import AnimateFade from '../wrap/AnimateFade';

interface LoaderProps {
  /** Scale of the loader from 1 to 10. */
  scale?: number;

  /** Show a circular loader. */
  circular?: boolean;
}

/**
 * Displays animated loader.
 */
function Loader({ scale = 5, circular }: LoaderProps) {
  const { colors } = useConceptOptions();
  return (
    <AnimateFade noFadeIn className='flex justify-center'>
      {circular ? (
        <ThreeCircles color={colors.bgPrimary} height={scale * 20} width={scale * 20} />
      ) : (
        <ThreeDots color={colors.bgPrimary} height={scale * 20} width={scale * 20} radius={scale * 2} />
      )}
    </AnimateFade>
  );
}

export default Loader;
