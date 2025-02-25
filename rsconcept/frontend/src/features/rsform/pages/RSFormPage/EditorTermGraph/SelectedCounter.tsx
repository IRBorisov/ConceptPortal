import { Overlay } from '@/components/Container';

interface SelectedCounterProps {
  totalCount: number;
  selectedCount: number;
  position?: string;
}

export function SelectedCounter({ totalCount, selectedCount, position = 'top-0 left-0' }: SelectedCounterProps) {
  if (selectedCount === 0) {
    return null;
  }
  return (
    <Overlay position={`px-2 ${position}`} className='select-none whitespace-nowrap cc-blur rounded-xl'>
      Выбор {selectedCount} из {totalCount}
    </Overlay>
  );
}
