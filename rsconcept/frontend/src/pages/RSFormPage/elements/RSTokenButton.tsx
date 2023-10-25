import { TokenID } from '../../../models/rslang';
import { describeToken, labelToken } from '../../../utils/labels';

interface RSTokenButtonProps {
  token: TokenID
  disabled?: boolean
  onInsert: (token: TokenID, key?: string) => void
}

function RSTokenButton({ token, disabled, onInsert }: RSTokenButtonProps) {
  const label = labelToken(token);
  const width = label.length > 3 ? 'w-[4.5rem]' : 'w-[2.25rem]';
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onInsert(token)}
      title={describeToken(token)}
      tabIndex={-1}
      className={`px-1 cursor-pointer disabled:cursor-default border rounded-none h-6 ${width} outline-none clr-hover clr-btn-clear`}
    >
      {label && <span className='whitespace-nowrap'>{label}</span>}
    </button>
  );
}

export default RSTokenButton;
