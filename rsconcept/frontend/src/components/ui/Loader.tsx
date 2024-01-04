'use client';

import { ThreeDots } from 'react-loader-spinner';

import { useConceptTheme } from '@/context/ThemeContext';

interface LoaderProps {
  size?: number;
}

export function Loader({ size = 10 }: LoaderProps) {
  const { colors } = useConceptTheme();
  return (
    <div className='flex justify-center'>
      <ThreeDots color={colors.bgSelected} height={size * 10} width={size * 10} radius={size} />
    </div>
  );
}
