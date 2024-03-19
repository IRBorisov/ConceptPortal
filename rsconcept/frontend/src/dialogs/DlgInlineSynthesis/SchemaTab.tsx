'use client';

import { useMemo } from 'react';

import SchemaPicker from '@/components/SchemaPicker';
import FlexColumn from '@/components/ui/FlexColumn';
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
    <FlexColumn>
      <TextInput
        id='dlg_selected_schema_title'
        label='Выбрана'
        noBorder
        placeholder='Выберите из списка ниже'
        value={selectedInfo?.title}
        disabled
        dense
      />
      <SchemaPicker rows={16} value={selected} onSelectValue={setSelected} />
    </FlexColumn>
  );
}

export default SchemaTab;
