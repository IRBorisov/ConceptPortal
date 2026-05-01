import clsx from 'clsx';

import { type Grammeme } from '@/domain/cctext';

import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

export interface WordformExample {
  question: string;
  answer: string;
}

interface WordformButtonProps {
  text: string;
  example: WordformExample;
  grams: readonly Grammeme[];
  isSelected?: boolean;
  onSelectGrams: (grams: Grammeme[]) => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function WordformButton({
  text,
  example,
  grams,
  onSelectGrams,
  isSelected,
  onDoubleClick,
  ...restProps
}: WordformButtonProps) {
  const setActiveTooltipText = useValueTooltipStore(state => state.setActiveText);

  return (
    <button
      type='button'
      tabIndex={-1}
      onClick={() => onSelectGrams([...grams])}
      className={clsx(
        'min-w-8 sm:min-w-12',
        'p-1',
        'border rounded-none',
        'cursor-pointer',
        'text-sm',
        'hover:bg-accent hover:text-foreground cc-animate-color',
        isSelected ? 'cc-selected' : 'text-muted-foreground'
      )}
      data-tooltip-id={globalIDs.value_tooltip}
      onPointerEnter={() => setActiveTooltipText(<WordformExampleTooltip example={example} />)}
      onDoubleClick={onDoubleClick}
      {...restProps}
    >
      {text}
    </button>
  );
}

function WordformExampleTooltip({ example }: { example: WordformExample }) {
  return (
    <div>
      <div>{example.question}</div>
      <div className='text-center font-bold'>{example.answer}</div>
    </div>
  );
}
