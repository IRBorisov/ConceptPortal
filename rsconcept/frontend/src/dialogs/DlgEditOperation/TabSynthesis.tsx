import { ErrorData } from '@/components/info/InfoError';
import PickSubstitutions from '@/components/select/PickSubstitutions';
import TextArea from '@/components/ui/TextArea';
import DataLoader from '@/components/wrap/DataLoader';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { ICstSubstitute } from '@/models/oss';
import { IRSForm } from '@/models/rsform';
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
  const { colors } = useConceptOptions();
  return (
    <DataLoader id='dlg-synthesis-tab' className='cc-column mt-3' isLoading={loading} error={error}>
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
        style={{ borderColor: isCorrect ? undefined : colors.fgRed }}
      />
    </DataLoader>
  );
}

export default TabSynthesis;
