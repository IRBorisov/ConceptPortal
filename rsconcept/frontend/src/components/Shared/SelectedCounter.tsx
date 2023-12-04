interface SelectedCounterProps {
  total: number
  selected: number
  position?: string
  hideZero?: boolean
}

function SelectedCounter({
  total, selected, hideZero,
  position = 'top-0 left-0',
} : SelectedCounterProps) {
  if (selected === 0 && hideZero) {
    return null;
  }
  return (
  <div className='relative w-full z-pop'>
  <div className={`absolute px-2 select-none whitespace-nowrap small-caps clr-app ${position}`}>
    Выбор {selected} из {total}
  </div>
  </div>);
}

export default SelectedCounter;