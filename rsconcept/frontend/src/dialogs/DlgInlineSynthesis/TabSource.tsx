'use client';

import { useLibrary } from '@/backend/library/useLibrary';
import PickSchema from '@/components/select/PickSchema';
import { TextInput } from '@/components/ui/Input';
import { LibraryItemID, LibraryItemType } from '@/models/library';
import { IRSForm } from '@/models/rsform';
import { sortItemsForInlineSynthesis } from '@/models/rsformAPI';

interface TabSourceProps {
  selected?: LibraryItemID;
  setSelected: (newValue: LibraryItemID) => void;
  receiver: IRSForm;
}

function TabSource({ selected, receiver, setSelected }: TabSourceProps) {
  const { items: libraryItems } = useLibrary();
  const selectedInfo = libraryItems.find(item => item.id === selected);
  const sortedItems = sortItemsForInlineSynthesis(receiver, libraryItems);
  return (
    <div className='cc-fade-in flex flex-col'>
      <PickSchema
        id='dlg_schema_picker' //
        items={sortedItems}
        itemType={LibraryItemType.RSFORM}
        rows={14}
        value={selected}
        onChange={setSelected}
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

export default TabSource;
