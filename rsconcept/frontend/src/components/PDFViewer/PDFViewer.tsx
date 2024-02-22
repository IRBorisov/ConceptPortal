'use client';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useMemo, useState } from 'react';
import { Document, Page } from 'react-pdf';

import useWindowSize from '@/hooks/useWindowSize';
import { graphLightT } from '@/styling/color';

import Overlay from '../ui/Overlay';
import PageControls from './PageControls';

const MAXIMUM_WIDTH = 1000;
const MINIMUM_WIDTH = 320;

interface PDFViewerProps {
  file?: string | ArrayBuffer | Blob;
}

function PDFViewer({ file }: PDFViewerProps) {
  const windowSize = useWindowSize();

  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const pageWidth = useMemo(() => {
    return Math.max(MINIMUM_WIDTH, Math.min((windowSize?.width ?? 0) - 10, MAXIMUM_WIDTH));
  }, [windowSize]);

  function onDocumentLoadSuccess({ numPages }: PDFDocumentProxy) {
    setPageCount(numPages);
  }

  return (
    <Document
      file={file}
      onLoadSuccess={onDocumentLoadSuccess}
      loading='Загрузка PDF файла...'
      error='Не удалось загрузить файл.'
    >
      <Overlay position='top-3 left-1/2 -translate-x-1/2' className='flex select-none'>
        <PageControls pageCount={pageCount} pageNumber={pageNumber} setPageNumber={setPageNumber} />
      </Overlay>
      <Page
        className='pointer-events-none select-none sm:translate-x-0'
        renderTextLayer={false}
        renderAnnotationLayer={false}
        pageNumber={pageNumber}
        width={pageWidth}
        canvasBackground={graphLightT.canvas.background}
      />
      <Overlay position='bottom-6 left-1/2 -translate-x-1/2' className='flex select-none'>
        <PageControls pageCount={pageCount} pageNumber={pageNumber} setPageNumber={setPageNumber} />
      </Overlay>
    </Document>
  );
}

export default PDFViewer;
