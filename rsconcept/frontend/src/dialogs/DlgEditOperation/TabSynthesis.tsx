import PickSubstitutions from '@/components/select/PickSubstitutions';
import TextArea from '@/components/ui/TextArea';
import { ICstSubstitute } from '@/models/oss';
import { IRSForm } from '@/models/rsform';
import { APP_COLORS } from '@/styling/color';
import { prefixes } from '@/utils/constants';

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
        prefixID={prefixes.dlg_cst_substitutes_list}
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
