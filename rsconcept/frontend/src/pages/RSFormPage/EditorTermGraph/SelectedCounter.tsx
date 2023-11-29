interface SelectedCounterProps {
  total: number
  selected: number
}

function SelectedCounter({ total, selected } : SelectedCounterProps) {
  if (selected === 0) {
    return null;
  }
  return (
  <div className='relative w-full z-pop'>
  <div className='absolute left-0 px-2 select-none top-[0.3rem] whitespace-nowrap small-caps clr-app'>
    Выбор {selected} из {total}
  </div>
  </div>);
}

export default SelectedCounter;