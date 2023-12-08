import { TokenID } from '../../../models/rslang';

interface RSLocalButtonProps {
  text: string
  tooltip: string
  disabled?: boolean
  onInsert: (token: TokenID, key?: string) => void
}

function RSLocalButton({ text, tooltip, disabled, onInsert }: RSLocalButtonProps) {
  return (
  <button type='button' tabIndex={-1}
    disabled={disabled}
    title={tooltip}
    className='w-[2rem] h-6 cursor-pointer disabled:cursor-default border rounded-none clr-hover clr-btn-clear'
    onClick={() => onInsert(TokenID.ID_LOCAL, text)}
  >
    {text}
  </button>);
}

export default RSLocalButton;
