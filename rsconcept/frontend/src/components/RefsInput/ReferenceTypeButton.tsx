import { ReferenceType } from '../../models/language';
import { labelReferenceType } from '../../utils/labels';

interface ReferenceTypeButtonProps {
  id?: string
  type: ReferenceType
  isSelected?: boolean
  onSelect: (type: ReferenceType) => void
}

function ReferenceTypeButton({ type, isSelected, onSelect, ...props }: ReferenceTypeButtonProps) {
  return (
    <button type='button' tabIndex={-1}
      onClick={() => onSelect(type)}
      className={`min-w-[12rem] px-2 py-1 border font-semibold rounded-none cursor-pointer clr-btn-clear clr-hover ${isSelected ? 'clr-selected': ''}`}
      {...props}
    >
      {labelReferenceType(type)}
    </button>
  );
}

export default ReferenceTypeButton;
