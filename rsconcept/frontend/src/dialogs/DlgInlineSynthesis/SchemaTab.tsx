'use client';

import { useMemo } from 'react';

import SchemaPicker from '@/components/select/SchemaPicker';
import TextInput from '@/components/ui/TextInput';
import { useLibrary } from '@/context/LibraryContext';
import { LibraryItemID } from '@/models/library';

interface SchemaTabProps {
  selected?: LibraryItemID;
  setSelected: React.Dispatch<LibraryItemID | undefined>;
}

function SchemaTab({ selected, setSelected }: SchemaTabProps) {
  const library = useLibrary();
  const selectedInfo = useMemo(() => library.items.find(item => item.id === selected), [selected, library.items]);

  return (
    <div className='flex flex-col'>
      <div className='flex gap-6 items-center'>
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
      <SchemaPicker rows={16} value={selected} onSelectValue={setSelected} />
    </div>
  );
}

export default SchemaTab;
