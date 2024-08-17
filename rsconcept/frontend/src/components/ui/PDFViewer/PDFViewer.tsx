'use client';

import { useMemo } from 'react';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useWindowSize from '@/hooks/useWindowSize';

const MAXIMUM_WIDTH = 1600;
const MINIMUM_WIDTH = 300;

interface PDFViewerProps {
  file?: string;
  offsetXpx?: number;
  minWidth?: number;
}

function PDFViewer({ file, offsetXpx, minWidth = MINIMUM_WIDTH }: PDFViewerProps) {
  const windowSize = useWindowSize();
  const { calculateHeight } = useConceptOptions();

  const pageWidth = useMemo(() => {
    return Math.max(minWidth, Math.min((windowSize?.width ?? 0) - (offsetXpx ?? 0) - 10, MAXIMUM_WIDTH));
  }, [windowSize, offsetXpx, minWidth]);
  const pageHeight = useMemo(() => calculateHeight('1rem'), [calculateHeight]);

  return <embed src={`${file}#toolbar=0`} className='p-3' style={{ width: pageWidth, height: pageHeight }} />;
}

export default PDFViewer;
