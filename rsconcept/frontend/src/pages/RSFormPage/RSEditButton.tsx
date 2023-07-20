import { TokenID } from '../../utils/models'
import { getRSButtonData } from '../../utils/staticUI'

interface RSEditButtonProps {
  id: TokenID
  disabled?: boolean
  onInsert: (token: TokenID) => void
}

function RSEditButton({id, disabled, onInsert}: RSEditButtonProps) {
  const data = getRSButtonData(id);
  const color = 'hover:bg-gray-300 dark:hover:bg-gray-400 text-gray-800 dark:text-zinc-200'
  const width = data.text.length > 3 ? 'w-[4rem]' : 'w-[2rem]';
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onInsert(id)}
      title={data.tooltip}
      tabIndex={-1}
      className={`px-1 cursor-pointer border rounded-none h-7 ${width} ${color}`}
    >
      {data.text && <span className='whitespace-nowrap'>{data.text}</span>}
    </button>
  )
}

export default RSEditButton;