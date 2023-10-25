import { ReferenceType } from '../../models/language';
import { labelReferenceType } from '../../utils/labels';
import SwitchButton from '../Common/SwitchButton';

interface ReferenceTypeButtonProps {
  type: ReferenceType
  isSelected?: boolean
  onSelect: (type: ReferenceType) => void
}

function ReferenceTypeButton({ type, isSelected, onSelect }: ReferenceTypeButtonProps) {
  return (
    <SwitchButton 
      value={type}
      isSelected={isSelected}
      onSelect={onSelect}
      dimensions='min-w-[12rem] h-fit'
      label={labelReferenceType(type)}
    />
  );
}

export default ReferenceTypeButton;
