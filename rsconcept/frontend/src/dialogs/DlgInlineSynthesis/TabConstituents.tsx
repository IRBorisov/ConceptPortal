'use client';

import { ErrorData } from '@/components/info/InfoError';
import PickMultiConstituenta from '@/components/select/PickMultiConstituenta';
import DataLoader from '@/components/wrap/DataLoader';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface TabConstituentsProps {
  schema?: IRSForm;
  loading?: boolean;
  error?: ErrorData;
  selected: ConstituentaID[];
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
}

function TabConstituents({ schema, error, loading, selected, setSelected }: TabConstituentsProps) {
  return (
    <DataLoader id='dlg-constituents-tab' isLoading={loading} error={error} hasNoData={!schema}>
      {schema ? (
        <PickMultiConstituenta
          schema={schema}
          data={schema.items}
          rows={13}
          prefixID={prefixes.cst_inline_synth_list}
          selected={selected}
          setSelected={setSelected}
        />
      ) : null}
    </DataLoader>
  );
}

export default TabConstituents;
