import { Grammeme } from '../../models/language';

interface WordformButtonProps {
  id?: string
  text: string
  example: string
  grams: Grammeme[]
  isSelected?: boolean
  onSelectGrams: (grams: Grammeme[]) => void
}

function WordformButton({ text, example, grams, onSelectGrams, isSelected, ...props }: WordformButtonProps) {
  return (
    <button
      type='button'
      onClick={() => onSelectGrams(grams)}
      tabIndex={-1}
      className={`min-w-[6rem] p-1 border rounded-none cursor-pointer clr-btn-clear clr-hover ${isSelected ? 'clr-selected': ''}`}
      {...props}
    >
      <p className='font-semibold'>{text}</p>
      <p>{example}</p>
    </button>
  );
}

export default WordformButton;
