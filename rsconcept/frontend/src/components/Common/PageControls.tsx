import { GotoFirstIcon, GotoLastIcon, GotoNextIcon, GotoPrevIcon } from '@/components/Icons';

interface PageControlsProps {
  pageNumber: number
  pageCount: number
  setPageNumber: React.Dispatch<React.SetStateAction<number>>
}

function PageControls({
  pageNumber, pageCount, setPageNumber
}: PageControlsProps) {
  return (
  <>
    <button type='button'
      className='clr-hover clr-text-controls'
      onClick={() => setPageNumber(1)}
      disabled={pageNumber < 2}
    >
      <GotoFirstIcon />
    </button>
    <button type='button'
      className='clr-hover clr-text-controls'
      onClick={() => setPageNumber(prev => prev - 1)}
      disabled={pageNumber < 2}
    >
      <GotoPrevIcon />
    </button>
    <p className='px-3 text-black'>Страница {pageNumber} из {pageCount}</p>
    <button type='button'
      className='clr-hover clr-text-controls'
      onClick={() => setPageNumber(prev => prev + 1)}
      disabled={pageNumber >= pageCount}
    >
      <GotoNextIcon />
    </button>
    <button type='button'
      className='clr-hover clr-text-controls'
      onClick={() => setPageNumber(pageCount)}
      disabled={pageNumber >= pageCount}
    >
      <GotoLastIcon />
    </button>
  </>);
}

export default PageControls;