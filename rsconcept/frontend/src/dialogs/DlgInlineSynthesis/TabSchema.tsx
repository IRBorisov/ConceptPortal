'use client';

import { useMemo } from 'react';

import PickSchema from '@/components/select/PickSchema';
import TextInput from '@/components/ui/TextInput';
import { useLibrary } from '@/context/LibraryContext';
import { LibraryItemID, LibraryItemType } from '@/models/library';
import { IRSForm } from '@/models/rsform';
import { sortItemsForInlineSynthesis } from '@/models/rsformAPI';

interface TabSchemaProps {
  selected?: LibraryItemID;
  setSelected: (newValue: LibraryItemID) => void;
  receiver: IRSForm;
}

function TabSchema({ selected, receiver, setSelected }: TabSchemaProps) {
  const library = useLibrary();
  const selectedInfo = useMemo(() => library.items.find(item => item.id === selected), [selected, library.items]);
  const sortedItems = useMemo(() => sortItemsForInlineSynthesis(receiver, library.items), [receiver, library.items]);

  return (
    <div className='cc-fade-in flex flex-col'>
      <PickSchema
        id='dlg_schema_picker' // prettier: split lines
        items={sortedItems}
        itemType={LibraryItemType.RSFORM}
        rows={14}
        value={selected}
        onSelectValue={setSelected}
      />
      <div className='flex items-center gap-6 '>
        <span className='select-none'>Выбрана</span>
        <TextInput
          id='dlg_selected_schema_title'
          disabled
          noBorder
          className='flex-grow'
          placeholder='Схема не выбрана'
          value={selectedInfo?.title ?? ''}
          dense
        />
      </div>
    </div>
  );
}

export default TabSchema;
