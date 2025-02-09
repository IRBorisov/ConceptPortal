import { TextArea } from '@/components/Input';
import PickSubstitutions from '@/features/rsform/components/PickSubstitutions';
import { IRSForm } from '@/features/rsform/models/rsform';
import { APP_COLORS } from '@/styling/color';

import { ICstSubstitute } from '../../models/oss';

interface TabSynthesisProps {
  validationText: string;
  isCorrect: boolean;

  schemas: IRSForm[];
  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;
  suggestions: ICstSubstitute[];
}

function TabSynthesis({
  schemas,
  validationText,
  isCorrect,
  substitutions,
  setSubstitutions,
  suggestions
}: TabSynthesisProps) {
  return (
    <div className='cc-fade-in cc-column mt-3'>
      <PickSubstitutions
        schemas={schemas}
        rows={8}
        value={substitutions}
        onChange={setSubstitutions}
        suggestions={suggestions}
      />
      <TextArea
        disabled
        value={validationText}
        rows={4}
        style={{ borderColor: isCorrect ? undefined : APP_COLORS.fgRed, borderWidth: isCorrect ? undefined : '2px' }}
      />
    </div>
  );
}

export default TabSynthesis;
