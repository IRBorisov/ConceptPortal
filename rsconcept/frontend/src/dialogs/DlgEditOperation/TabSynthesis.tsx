import { ErrorData } from '@/components/info/InfoError';
import PickSubstitutions from '@/components/select/PickSubstitutions';
import DataLoader from '@/components/wrap/DataLoader';
import { LibraryItemID } from '@/models/library';
import { ICstSubstitute, IOperation } from '@/models/oss';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface TabSynthesisProps {
  loading: boolean;
  error: ErrorData;

  operations: IOperation[];
  getSchema: (id: LibraryItemID) => IRSForm | undefined;
  getConstituenta: (id: ConstituentaID) => IConstituenta | undefined;
  getSchemaByCst: (id: ConstituentaID) => IRSForm | undefined;
  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;
}

function TabSynthesis({
  operations,
  loading,
  error,
  getSchema,
  getConstituenta,
  getSchemaByCst,
  substitutions,
  setSubstitutions
}: TabSynthesisProps) {
  return (
    <DataLoader id='dlg-synthesis-tab' className='cc-column' isLoading={loading} error={error}>
      <PickSubstitutions
        prefixID={prefixes.dlg_cst_substitutes_list}
        rows={8}
        operations={operations}
        getSchema={getSchema}
        getConstituenta={getConstituenta}
        getSchemaByCst={getSchemaByCst}
        substitutions={substitutions}
        setSubstitutions={setSubstitutions}
      />
    </DataLoader>
  );
}

export default TabSynthesis;
