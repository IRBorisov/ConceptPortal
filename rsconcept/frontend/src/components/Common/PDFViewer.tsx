import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useMemo, useState } from 'react';
import { Document, Page } from 'react-pdf';

import useWindowSize from '../../hooks/useWindowSize';
import { graphLightT } from '../../utils/color';
import Overlay from './Overlay';
import PageControls from './PageControls';

const MAXIMUM_WIDTH = 1000;
const MINIMUM_WIDTH = 600;

interface PDFViewerProps {
  file?: string | ArrayBuffer | Blob 
}

function PDFViewer({
  file
}: PDFViewerProps) {
  const windowSize = useWindowSize();

  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  
  const pageWidth = useMemo(
  () => {
    return Math.max(MINIMUM_WIDTH, (Math.min((windowSize?.width ?? 0) - 300, MAXIMUM_WIDTH)));
  }, [windowSize]);

  function onDocumentLoadSuccess({ numPages }: PDFDocumentProxy) {
    setPageCount(numPages);
  }

  return (
  <Document
    file={file}
    onLoadSuccess={onDocumentLoadSuccess}
    className='mx-3 w-fit'
  >
    <Overlay position='top-6 left-1/2 -translate-x-1/2' className='flex select-none'>
      <PageControls 
        pageCount={pageCount}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
    </Overlay>
    <Page
      className='select-none pointer-events-none'
      renderTextLayer={false}
      renderAnnotationLayer={false}
      pageNumber={pageNumber}
      width={pageWidth}
      canvasBackground={graphLightT.canvas.background}
    />
    <Overlay position='bottom-6 left-1/2 -translate-x-1/2' className='flex select-none'>
      <PageControls 
        pageCount={pageCount}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
    </Overlay>
  </Document>);
}

export default PDFViewer;