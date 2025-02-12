'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { TextInput } from '@/components/Input';
import { LibraryItemType, PickSchema, useLibrary } from '@/features/library';
import { useDialogsStore } from '@/stores/dialogs';

import { IInlineSynthesisDTO } from '../../backend/types';
import { sortItemsForInlineSynthesis } from '../../models/rsformAPI';
import { DlgInlineSynthesisProps } from './DlgInlineSynthesis';

function TabSource() {
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
