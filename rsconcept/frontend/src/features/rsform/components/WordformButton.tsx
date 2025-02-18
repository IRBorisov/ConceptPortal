import clsx from 'clsx';

import { Grammeme } from '../models/language';

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
        'min-w-[4.15rem] sm:min-w-[6.15rem]',
        'p-1',
        'border rounded-none',
        'cursor-pointer',
        'clr-text-controls clr-hover cc-animate-color',
        isSelected && 'clr-selected'
      )}
      {...restProps}
    >
      <p className='font-medium'>{text}</p>
      <p>{example}</p>
    </button>
  );
}
