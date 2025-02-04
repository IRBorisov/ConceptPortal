'use client';

import { useRSFormSuspense } from '@/backend/rsform/useRSForm';
import PickMultiConstituenta from '@/components/select/PickMultiConstituenta';
import { LibraryItemID } from '@/models/library';
import { ConstituentaID } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface TabConstituentsProps {
  itemID: LibraryItemID;
  selected: ConstituentaID[];
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
}

function TabConstituents({ itemID, selected, setSelected }: TabConstituentsProps) {
  const { schema } = useRSFormSuspense({ itemID });

  return (
    <PickMultiConstituenta
      schema={schema}
      data={schema.items}
      rows={13}
      prefixID={prefixes.cst_inline_synth_list}
      value={selected}
      onChange={setSelected}
    />
  );
}

export default TabConstituents;
