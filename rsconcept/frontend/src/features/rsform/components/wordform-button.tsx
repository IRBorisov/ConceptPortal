import clsx from 'clsx';

import { type Grammeme } from '@/domain/cctext';

import { globalIDs } from '@/utils/constants';

interface WordformButtonProps {
  text: string;
  example: string;
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
      data-tooltip-html={example}
      onDoubleClick={onDoubleClick}
      {...restProps}
    >
      {text}
    </button>
  );
}
