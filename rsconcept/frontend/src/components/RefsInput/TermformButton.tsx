import { Grammeme } from '../../models/language';

interface TermformButtonProps {
  id?: string
  text: string
  example: string
  grams: Grammeme[]
  isSelected?: boolean
  onSelectGrams: (grams: Grammeme[]) => void
}

function TermformButton({ text, example, grams, onSelectGrams, isSelected, ...props }: TermformButtonProps) {
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

export default TermformButton;
