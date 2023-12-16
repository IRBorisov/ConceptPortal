import { BiChevronLeft, BiChevronRight, BiFirstPage, BiLastPage } from 'react-icons/bi';

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
      <BiFirstPage size='1.5rem' />
    </button>
    <button type='button'
      className='clr-hover clr-text-controls'
      onClick={() => setPageNumber(prev => prev - 1)}
      disabled={pageNumber < 2}
    >
      <BiChevronLeft size='1.5rem' />
    </button>
    <p className='px-3 text-black'>Страница {pageNumber} из {pageCount}</p>
    <button type='button'
      className='clr-hover clr-text-controls'
      onClick={() => setPageNumber(prev => prev + 1)}
      disabled={pageNumber >= pageCount}
    >
      <BiChevronRight size='1.5rem' />
    </button>
    <button type='button'
      className='clr-hover clr-text-controls'
      onClick={() => setPageNumber(pageCount)}
      disabled={pageNumber >= pageCount}
    >
      <BiLastPage size='1.5rem' />
    </button>
  </>);
}

export default PageControls;