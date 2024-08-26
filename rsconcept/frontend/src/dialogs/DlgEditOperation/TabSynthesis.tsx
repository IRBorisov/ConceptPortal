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
}

function TabSynthesis({
  schemas,
  loading,
  error,
  validationText,
  isCorrect,
  substitutions,
  setSubstitutions
}: TabSynthesisProps) {
  const { colors } = useConceptOptions();
  return (
    <DataLoader id='dlg-synthesis-tab' className='cc-column mt-3' isLoading={loading} error={error}>
      <PickSubstitutions
        schemas={schemas}
        prefixID={prefixes.dlg_cst_substitutes_list}
        rows={10}
        substitutions={substitutions}
        setSubstitutions={setSubstitutions}
      />
      <TextArea disabled value={validationText} style={{ borderColor: isCorrect ? undefined : colors.fgRed }} />
    </DataLoader>
  );
}

export default TabSynthesis;
