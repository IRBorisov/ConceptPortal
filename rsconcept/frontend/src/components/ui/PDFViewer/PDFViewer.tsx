'use client';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useMemo, useState } from 'react';
import { Document, Page } from 'react-pdf';

import useWindowSize from '@/hooks/useWindowSize';
import { graphLightT } from '@/styling/color';

import Overlay from '../Overlay';
import PageControls from './PageControls';

const MAXIMUM_WIDTH = 1000;
const MINIMUM_WIDTH = 300;

interface PDFViewerProps {
  file?: string | ArrayBuffer | Blob;
  offsetXpx?: number;
  minWidth?: number;
}

function PDFViewer({ file, offsetXpx, minWidth = MINIMUM_WIDTH }: PDFViewerProps) {
  const windowSize = useWindowSize();

  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const pageWidth = useMemo(() => {
    return Math.max(minWidth, Math.min((windowSize?.width ?? 0) - (offsetXpx ?? 0) - 10, MAXIMUM_WIDTH));
  }, [windowSize, offsetXpx, minWidth]);

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
        className='overflow-hidden pointer-events-none select-none'
        renderTextLayer={false}
        renderAnnotationLayer={false}
        pageNumber={pageNumber}
        width={pageWidth}
        canvasBackground={graphLightT.canvas.background}
      />
      <Overlay position='bottom-3 left-1/2 -translate-x-1/2' className='flex select-none'>
        <PageControls pageCount={pageCount} pageNumber={pageNumber} setPageNumber={setPageNumber} />
      </Overlay>
    </Document>
  );
}

export default PDFViewer;
