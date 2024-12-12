'use client';

import { ThreeCircles, ThreeDots } from 'react-loader-spinner';

import { useConceptOptions } from '@/context/ConceptOptionsContext';

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
  if (circular) {
    return (
      <ThreeCircles
        color={colors.bgPrimary}
        height={scale * 20}
        width={scale * 20}
        wrapperClass='flex justify-center'
      />
    );
  } else {
    return (
      <ThreeDots
        color={colors.bgPrimary}
        height={scale * 20}
        width={scale * 20}
        radius={scale * 2}
        wrapperClass='flex justify-center'
      />
    );
  }
}

export default Loader;
