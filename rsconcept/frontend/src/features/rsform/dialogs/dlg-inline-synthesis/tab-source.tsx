'use client';

import { LibraryItemType } from '@/domain/library';
import { type RSForm } from '@/domain/library';
import { sortItemsForInlineSynthesis } from '@/domain/library/rsform-api';

import { useLibrary } from '@/features/library/backend/use-library';
import { PickSchema } from '@/features/library/components/pick-schema';

import { TextInput } from '@/components/input';

interface TabSourceProps {
  receiver: RSForm;
  sourceID: number | null;
  onChangeSource: (newValue: number) => void;
}

export function TabSource({ receiver, sourceID, onChangeSource }: TabSourceProps) {
  const { items: libraryItems } = useLibrary();
  const selectedInfo = libraryItems.find(item => item.id === sourceID);
  const sortedItems = sortItemsForInlineSynthesis(receiver, libraryItems);

  return (
    <div className='cc-fade-in flex flex-col'>
      <PickSchema
        id='dlg_schema_picker'
        items={sortedItems}
        itemType={LibraryItemType.RSFORM}
        rows={14}
        value={sourceID}
        onChange={onChangeSource}
      />

      <div className='flex items-center gap-6 '>
        <span className='select-none'>Выбрана</span>
        <TextInput
          id='dlg_selected_schema_title'
          disabled
          noBorder
          className='grow'
          placeholder='Схема не выбрана'
          value={selectedInfo?.title ?? ''}
          dense
        />
      </div>
    </div>
  );
}
