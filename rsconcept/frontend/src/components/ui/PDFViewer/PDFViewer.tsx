'use client';

import { useMemo } from 'react';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useWindowSize from '@/hooks/useWindowSize';

/** Maximum width of the viewer. */
const MAXIMUM_WIDTH = 1600;

/** Minimum width of the viewer. */
const MINIMUM_WIDTH = 300;

interface PDFViewerProps {
  /** PDF file to display. */
  file?: string;

  /** Offset from the left side of the window. */
  offsetXpx?: number;

  /** Minimum width of the viewer. */
  minWidth?: number;
}

/**
 * Displays a PDF file using an embedded viewer.
 */
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
