import { TokenID } from '../../utils/models'

interface  RSLocalButtonProps {
  text: string
  tooltip: string
  disabled?: boolean
  onInsert: (token: TokenID, key?: string) => void
}

function RSLocalButton({text, tooltip, disabled, onInsert}: RSLocalButtonProps) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onInsert(TokenID.ID_LOCAL, text)}
      title={tooltip}
      tabIndex={-1}
      className='w-[1.5rem] h-7 cursor-pointer border rounded-none clr-btn-clear'
    >
      {text}
    </button>
  );
}

export default RSLocalButton;