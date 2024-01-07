'use client';

import { ThreeDots } from 'react-loader-spinner';

import { useConceptTheme } from '@/context/ThemeContext';

import AnimateFade from '../AnimateFade';

interface LoaderProps {
  size?: number;
}

function Loader({ size = 10 }: LoaderProps) {
  const { colors } = useConceptTheme();
  return (
    <AnimateFade noFadeIn className='flex justify-center'>
      <ThreeDots color={colors.bgPrimary} height={size * 10} width={size * 10} radius={size} />
    </AnimateFade>
  );
}

export default Loader;
