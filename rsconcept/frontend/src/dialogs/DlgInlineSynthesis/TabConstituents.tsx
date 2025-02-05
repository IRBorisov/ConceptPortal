'use client';

import { useRSFormSuspense } from '@/backend/rsform/useRSForm';
import PickMultiConstituenta from '@/components/select/PickMultiConstituenta';
import { LibraryItemID } from '@/models/library';
import { ConstituentaID } from '@/models/rsform';

interface TabConstituentsProps {
  itemID: LibraryItemID;
  selected: ConstituentaID[];
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
}

function TabConstituents({ itemID, selected, setSelected }: TabConstituentsProps) {
  const { schema } = useRSFormSuspense({ itemID });

  return (
    <PickMultiConstituenta schema={schema} items={schema.items} rows={13} value={selected} onChange={setSelected} />
  );
}

export default TabConstituents;
