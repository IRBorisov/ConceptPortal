import { ErrorData } from '@/components/info/InfoError';
import PickSubstitutions from '@/components/select/PickSubstitutions';
import DataLoader from '@/components/wrap/DataLoader';
import { ICstSubstitute } from '@/models/oss';
import { IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface TabSynthesisProps {
  loading: boolean;
  error: ErrorData;

  schemas: IRSForm[];
  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;
}

function TabSynthesis({ schemas, loading, error, substitutions, setSubstitutions }: TabSynthesisProps) {
  return (
    <DataLoader id='dlg-synthesis-tab' className='cc-column mt-3' isLoading={loading} error={error}>
      <PickSubstitutions
        schemas={schemas}
        prefixID={prefixes.dlg_cst_substitutes_list}
        rows={8}
        substitutions={substitutions}
        setSubstitutions={setSubstitutions}
      />
    </DataLoader>
  );
}

export default TabSynthesis;
