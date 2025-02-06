'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { useLibrary } from '@/backend/library/useLibrary';
import { IconReset } from '@/components/Icons';
import PickSchema from '@/components/select/PickSchema';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import { ModalForm } from '@/components/ui/Modal';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';
import { IOperation, IOperationSchema, OperationID } from '@/models/oss';
import { sortItemsForOSS } from '@/models/ossAPI';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgChangeInputSchemaProps {
  oss: IOperationSchema;
  target: IOperation;
  onSubmit: (target: OperationID, newSchema: LibraryItemID | undefined) => void;
}

function DlgChangeInputSchema() {
  const { oss, target, onSubmit } = useDialogsStore(state => state.props as DlgChangeInputSchemaProps);
  const [selected, setSelected] = useState<LibraryItemID | undefined>(target.result ?? undefined);
  const { items } = useLibrary();
  const sortedItems = sortItemsForOSS(oss, items);
  const isValid = target.result !== selected;

  function baseFilter(item: ILibraryItem) {
    return !oss.schemas.includes(item.id) || item.id === selected || item.id === target.result;
  }

  function handleSelectLocation(newValue: LibraryItemID) {
    setSelected(newValue);
  }

  function handleSubmit() {
    onSubmit(target.id, selected);
    return true;
  }

  return (
    <ModalForm
      overflowVisible
      header='Выбор концептуальной схемы'
      submitText='Подтвердить выбор'
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className={clsx('w-[35rem]', 'pb-3 px-6 cc-column')}
    >
      <div className='flex justify-between gap-3 items-center'>
        <div className='flex gap-3'>
          <Label text='Загружаемая концептуальная схема' />
          <MiniButton
            title='Сбросить выбор схемы'
            noHover
            noPadding
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={() => setSelected(undefined)}
            disabled={selected == undefined}
          />
        </div>
      </div>
      <PickSchema
        items={sortedItems}
        itemType={LibraryItemType.RSFORM}
        value={selected} // prettier: split-line
        onChange={handleSelectLocation}
        rows={14}
        baseFilter={baseFilter}
      />
    </ModalForm>
  );
}

export default DlgChangeInputSchema;
