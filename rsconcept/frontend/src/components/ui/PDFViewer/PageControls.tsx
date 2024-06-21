import { IconPageFirst, IconPageLast, IconPageLeft, IconPageRight } from '@/components/Icons';

interface PageControlsProps {
  pageNumber: number;
  pageCount: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
}

function PageControls({ pageNumber, pageCount, setPageNumber }: PageControlsProps) {
  return (
    <div className='flex items-center'>
      <button
        type='button'
        className='clr-hover clr-text-controls'
        onClick={() => setPageNumber(1)}
        disabled={pageNumber < 2}
      >
        <IconPageFirst size='1.5rem' />
      </button>
      <button
        type='button'
        className='clr-hover clr-text-controls'
        onClick={() => setPageNumber(prev => prev - 1)}
        disabled={pageNumber < 2}
      >
        <IconPageLeft size='1.5rem' />
      </button>
      <div className='px-3 text-nowrap'>
        Страница {pageNumber} из {pageCount}
      </div>
      <button
        type='button'
        className='clr-hover clr-text-controls'
        onClick={() => setPageNumber(prev => prev + 1)}
        disabled={pageNumber >= pageCount}
      >
        <IconPageRight size='1.5rem' />
      </button>
      <button
        type='button'
        className='clr-hover clr-text-controls'
        onClick={() => setPageNumber(pageCount)}
        disabled={pageNumber >= pageCount}
      >
        <IconPageLast size='1.5rem' />
      </button>
    </div>
  );
}

export default PageControls;
