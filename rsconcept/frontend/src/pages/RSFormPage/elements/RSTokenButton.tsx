import { TokenID } from '../../../utils/enums';
import { getRSButtonData } from '../../../utils/staticUI'

interface RSTokenButtonProps {
  id: TokenID
  disabled?: boolean
  onInsert: (token: TokenID, key?: string) => void
}

function RSTokenButton({ id, disabled, onInsert }: RSTokenButtonProps) {
  const data = getRSButtonData(id);
  const width = data.text.length > 3 ? 'w-[4rem]' : 'w-[2rem]';
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onInsert(id)}
      title={data.tooltip}
      tabIndex={-1}
      className={`px-1 cursor-pointer border rounded-none h-7 ${width} clr-outline clr-btn-clear`}
    >
      {data.text && <span className='whitespace-nowrap'>{data.text}</span>}
    </button>
  );
}

export default RSTokenButton;
