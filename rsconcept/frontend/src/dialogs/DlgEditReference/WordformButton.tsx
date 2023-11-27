import { Grammeme } from '../../models/language';

interface WordformButtonProps {
  text: string
  example: string
  grams: Grammeme[]
  isSelected?: boolean
  onSelectGrams: (grams: Grammeme[]) => void
}

function WordformButton({ text, example, grams, onSelectGrams, isSelected, ...props }: WordformButtonProps) {
  return (
    <button type='button' tabIndex={-1}
      onClick={() => onSelectGrams(grams)}
      className={`min-w-[6rem] p-1 border rounded-none cursor-pointer clr-btn-clear clr-hover ${isSelected ? 'clr-selected': ''}`}
      {...props}
    >
      <p className='font-semibold'>{text}</p>
      <p>{example}</p>
    </button>
  );
}

export default WordformButton;
