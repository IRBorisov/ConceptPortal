import { ErrorData } from '@/components/info/InfoError';
import PickSubstitutions from '@/components/select/PickSubstitutions';
import TextArea from '@/components/ui/TextArea';
import DataLoader from '@/components/wrap/DataLoader';
import { ICstSubstitute } from '@/models/oss';
import { IRSForm } from '@/models/rsform';
import { APP_COLORS } from '@/styling/color';
import { prefixes } from '@/utils/constants';

interface TabSynthesisProps {
  loading: boolean;
  error: ErrorData;
  validationText: string;
  isCorrect: boolean;

  schemas: IRSForm[];
  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;
  suggestions: ICstSubstitute[];
}

function TabSynthesis({
  schemas,
  loading,
  error,
  validationText,
  isCorrect,
  substitutions,
  setSubstitutions,
  suggestions
}: TabSynthesisProps) {
  return (
    <DataLoader isLoading={loading} error={error}>
      <div className='cc-fade-in cc-column mt-3'>
        <PickSubstitutions
          schemas={schemas}
          prefixID={prefixes.dlg_cst_substitutes_list}
          rows={8}
          substitutions={substitutions}
          setSubstitutions={setSubstitutions}
          suggestions={suggestions}
        />
        <TextArea
          disabled
          value={validationText}
          rows={4}
          style={{ borderColor: isCorrect ? undefined : APP_COLORS.fgRed }}
        />
      </div>
    </DataLoader>
  );
}

export default TabSynthesis;
