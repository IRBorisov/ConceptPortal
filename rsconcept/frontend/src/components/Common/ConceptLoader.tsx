'use client';

import { ThreeDots } from 'react-loader-spinner';

import { useConceptTheme } from '@/context/ThemeContext';

interface ConceptLoaderProps {
  size?: number
}

export function ConceptLoader({size=10}: ConceptLoaderProps) {
  const {colors} = useConceptTheme();
  return (
  <div className='flex justify-center w-full h-full'>
    <ThreeDots
      color={colors.bgSelected}
      height={size*10}
      width={size*10}
      radius={size}
    />
  </div>);
}