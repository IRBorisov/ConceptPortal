'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import { IconReset } from '@/components/Icons';
import PickSchema from '@/components/select/PickSchema';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Modal, { ModalProps } from '@/components/ui/Modal';
import { useLibrary } from '@/context/LibraryContext';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';
import { IOperation, IOperationSchema } from '@/models/oss';
import { sortItemsForOSS } from '@/models/ossAPI';

interface DlgChangeInputSchemaProps extends Pick<ModalProps, 'hideWindow'> {
  oss: IOperationSchema;
  target: IOperation;
  onSubmit: (newSchema: LibraryItemID | undefined) => void;
}

function DlgChangeInputSchema({ oss, hideWindow, target, onSubmit }: DlgChangeInputSchemaProps) {
  const [selected, setSelected] = useState<LibraryItemID | undefined>(target.result ?? undefined);
  const library = useLibrary();
  const sortedItems = useMemo(() => sortItemsForOSS(oss, library.items), [oss, library.items]);

  const baseFilter = useCallback(
    (item: ILibraryItem) => !oss.schemas.includes(item.id) || item.id === selected || item.id === target.result,
    [oss, selected, target]
  );

  const isValid = useMemo(() => target.result !== selected, [target, selected]);

  const handleSelectLocation = useCallback((newValue: LibraryItemID) => {
    setSelected(newValue);
  }, []);

  return (
    <Modal
      overflowVisible
      header='Выбор концептуальной схемы'
      submitText='Подтвердить выбор'
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={() => onSubmit(selected)}
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
        onSelectValue={handleSelectLocation}
        rows={14}
        baseFilter={baseFilter}
      />
    </Modal>
  );
}

export default DlgChangeInputSchema;
