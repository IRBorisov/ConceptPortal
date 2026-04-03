import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { type Grammeme } from '../models/language';

interface WordformButtonProps {
  text: string;
  example: string;
  grams: readonly Grammeme[];
  isSelected?: boolean;
  onSelectGrams: (grams: Grammeme[]) => void;
}

export function WordformButton({ text, example, grams, onSelectGrams, isSelected, ...restProps }: WordformButtonProps) {
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
      data-tooltip-id={example ? globalIDs.tooltip : undefined}
      data-tooltip-content={example}
      {...restProps}
    >
      {text}
    </button>
  );
}
