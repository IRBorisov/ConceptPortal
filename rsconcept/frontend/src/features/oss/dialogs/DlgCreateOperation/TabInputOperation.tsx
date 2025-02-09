'use client';

import { useEffect } from 'react';

import { MiniButton } from '@/components/Control';
import { IconReset } from '@/components/Icons';
import { Checkbox, Label, TextArea, TextInput } from '@/components/Input';
import { useLibrary } from '@/features/library/backend/useLibrary';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/features/library/models/library';
import { IOperationSchema } from '@/features/oss/models/oss';
import { sortItemsForOSS } from '@/features/oss/models/ossAPI';
import PickSchema from '@/features/rsform/components/PickSchema';

interface TabInputOperationProps {
  oss: IOperationSchema;
  alias: string;
  onChangeAlias: (newValue: string) => void;
  title: string;
  onChangeTitle: (newValue: string) => void;
  comment: string;
  onChangeComment: (newValue: string) => void;
  attachedID: LibraryItemID | undefined;
  onChangeAttachedID: (newValue: LibraryItemID | undefined) => void;
  createSchema: boolean;
  onChangeCreateSchema: (newValue: boolean) => void;
}

function TabInputOperation({
  oss,
  alias,
  onChangeAlias,
  title,
  onChangeTitle,
  comment,
  onChangeComment,
  attachedID,
  onChangeAttachedID,
  createSchema,
  onChangeCreateSchema
}: TabInputOperationProps) {
  const { items: libraryItems } = useLibrary();
  const sortedItems = sortItemsForOSS(oss, libraryItems);

  function baseFilter(item: ILibraryItem) {
    return !oss.schemas.includes(item.id);
  }

  useEffect(() => {
    if (createSchema) {
      onChangeAttachedID(undefined);
    }
  }, [createSchema, onChangeAttachedID]);

  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        value={title}
        onChange={event => onChangeTitle(event.target.value)}
        disabled={attachedID !== undefined}
      />
      <div className='flex gap-6'>
        <TextInput
          id='operation_alias'
          label='Сокращение'
          className='w-[16rem]'
          value={alias}
          onChange={event => onChangeAlias(event.target.value)}
          disabled={attachedID !== undefined}
        />

        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          value={comment}
          onChange={event => onChangeComment(event.target.value)}
          disabled={attachedID !== undefined}
        />
      </div>

      <div className='flex justify-between gap-3 items-center'>
        <div className='flex gap-3'>
          <Label text='Загружаемая концептуальная схема' />
          <MiniButton
            title='Сбросить выбор схемы'
            noHover
            noPadding
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={() => onChangeAttachedID(undefined)}
            disabled={attachedID == undefined}
          />
        </div>
        <Checkbox
          value={createSchema}
          onChange={onChangeCreateSchema}
          label='Создать новую схему'
          titleHtml='Создать пустую схему для загрузки'
        />
      </div>
      {!createSchema ? (
        <PickSchema
          items={sortedItems}
          value={attachedID}
          itemType={LibraryItemType.RSFORM}
          onChange={onChangeAttachedID}
          rows={8}
          baseFilter={baseFilter}
        />
      ) : null}
    </div>
  );
}

export default TabInputOperation;
