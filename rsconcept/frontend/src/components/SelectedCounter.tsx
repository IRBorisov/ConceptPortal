import Overlay from '@/components/ui/Overlay';

interface SelectedCounterProps {
  totalCount: number;
  selectedCount: number;
  position?: string;
  hideZero?: boolean;
}

function SelectedCounter({ totalCount, selectedCount, hideZero, position = 'top-0 left-0' }: SelectedCounterProps) {
  if (selectedCount === 0 && hideZero) {
    return null;
  }
  return (
    <Overlay position={`px-2 ${position}`} className='select-none whitespace-nowrap clr-app'>
      Выбор {selectedCount} из {totalCount}
    </Overlay>
  );
}

export default SelectedCounter;
