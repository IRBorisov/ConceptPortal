'use client';

import { useMemo } from 'react';

import PickSchema from '@/components/select/PickSchema';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useLibrary } from '@/context/LibraryContext';
import { LibraryItemID, LibraryItemType } from '@/models/library';

interface TabSchemaProps {
  selected?: LibraryItemID;
  setSelected: (newValue: LibraryItemID) => void;
}

function TabSchema({ selected, setSelected }: TabSchemaProps) {
  const library = useLibrary();
  const selectedInfo = useMemo(() => library.items.find(item => item.id === selected), [selected, library.items]);

  return (
    <AnimateFade className='flex flex-col'>
      <div className='flex items-center gap-6'>
        <span className='select-none'>Выбрана</span>
        <TextInput
          id='dlg_selected_schema_title'
          disabled
          noBorder
          className='w-full'
          placeholder='Выберите из списка ниже'
          value={selectedInfo?.title ?? ''}
          dense
        />
      </div>
      <PickSchema
        id='dlg_schema_picker' // prettier: split lines
        items={library.items}
        itemType={LibraryItemType.RSFORM}
        rows={15}
        value={selected}
        onSelectValue={setSelected}
      />
    </AnimateFade>
  );
}

export default TabSchema;
