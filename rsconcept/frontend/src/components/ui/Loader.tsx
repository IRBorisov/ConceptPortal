'use client';

import { ThreeDots } from 'react-loader-spinner';

import { useConceptOptions } from '@/context/OptionsContext';

import AnimateFade from '../wrap/AnimateFade';

interface LoaderProps {
  size?: number;
}

function Loader({ size = 10 }: LoaderProps) {
  const { colors } = useConceptOptions();
  return (
    <AnimateFade noFadeIn className='flex justify-center'>
      <ThreeDots color={colors.bgPrimary} height={size * 10} width={size * 10} radius={size} />
    </AnimateFade>
  );
}

export default Loader;
