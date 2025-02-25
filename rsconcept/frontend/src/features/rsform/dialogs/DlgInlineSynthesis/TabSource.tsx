'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { LibraryItemType } from '@/features/library';
import { useLibrary } from '@/features/library/backend/useLibrary';
import { PickSchema } from '@/features/library/components';

import { TextInput } from '@/components/Input';
import { useDialogsStore } from '@/stores/dialogs';

import { type IInlineSynthesisDTO } from '../../backend/types';
import { sortItemsForInlineSynthesis } from '../../models/rsformAPI';

import { type DlgInlineSynthesisProps } from './DlgInlineSynthesis';

export function TabSource() {
  const { items: libraryItems } = useLibrary();
  const { receiver } = useDialogsStore(state => state.props as DlgInlineSynthesisProps);
  const { setValue, control } = useFormContext<IInlineSynthesisDTO>();
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
