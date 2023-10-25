import { TokenID } from '../../../models/rslang';

interface RSLocalButtonProps {
  text: string
  tooltip: string
  disabled?: boolean
  onInsert: (token: TokenID, key?: string) => void
}

function RSLocalButton({ text, tooltip, disabled, onInsert }: RSLocalButtonProps) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onInsert(TokenID.ID_LOCAL, text)}
      title={tooltip}
      tabIndex={-1}
      className='w-[2rem] h-6 cursor-pointer disabled:cursor-default border rounded-none clr-hover clr-btn-clear'
    >
      {text}
    </button>
  );
}

export default RSLocalButton;
