'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { LibraryItemType } from '@/features/library';
import { useLibrary } from '@/features/library/backend/use-library';
import { PickSchema } from '@/features/library/components/pick-schema';

import { TextInput } from '@/components/input';

import { type InlineSynthesisDTO } from '../../backend/types';
import { type RSForm } from '../../models/rsform';
import { sortItemsForInlineSynthesis } from '../../models/rsform-api';

interface TabSourceProps {
  receiver: RSForm;
}

export function TabSource({ receiver }: TabSourceProps) {
  const { items: libraryItems } = useLibrary();
  const { setValue, control } = useFormContext<InlineSynthesisDTO>();
  const sourceID = useWatch({ control, name: 'source' });

  const selectedInfo = libraryItems.find(item => item.id === sourceID);
  const sortedItems = sortItemsForInlineSynthesis(receiver, libraryItems);

  function handleSelectSource(newValue: number) {
    if (newValue === sourceID) {
      return;
    }
    setValue('source', newValue);
    setValue('items', []);
    setValue('substitutions', []);
  }

  return (
    <div className='cc-fade-in flex flex-col'>
      <PickSchema
        id='dlg_schema_picker'
        items={sortedItems}
        itemType={LibraryItemType.RSFORM}
        rows={14}
        value={sourceID}
        onChange={handleSelectSource}
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
