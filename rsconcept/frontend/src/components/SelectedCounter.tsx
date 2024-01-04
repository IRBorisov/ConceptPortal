import Overlay from '@/components/ui/Overlay';

interface SelectedCounterProps {
  total: number;
  selected: number;
  position?: string;
  hideZero?: boolean;
}

function SelectedCounter({ total, selected, hideZero, position = 'top-0 left-0' }: SelectedCounterProps) {
  if (selected === 0 && hideZero) {
    return null;
  }
  return (
    <Overlay position={`px-2 ${position}`} className='select-none whitespace-nowrap clr-app'>
      Выбор {selected} из {total}
    </Overlay>
  );
}

export default SelectedCounter;
