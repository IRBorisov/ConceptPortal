import clsx from 'clsx';

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
        'min-w-15 sm:min-w-20',
        'p-1',
        'border rounded-none',
        'cursor-pointer',
        'cc-controls cc-hover cc-animate-color',
        isSelected && 'cc-selected'
      )}
      {...restProps}
    >
      <p className='font-medium'>{text}</p>
      <p>{example}</p>
    </button>
  );
}
