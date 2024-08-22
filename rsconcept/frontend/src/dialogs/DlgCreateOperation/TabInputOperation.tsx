'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { IconReset } from '@/components/Icons';
import PickSchema from '@/components/select/PickSchema';
import Checkbox from '@/components/ui/Checkbox';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useLibrary } from '@/context/LibraryContext';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';
import { IOperationSchema } from '@/models/oss';
import { sortItemsForOSS } from '@/models/ossAPI';

interface TabInputOperationProps {
  oss: IOperationSchema;
  alias: string;
  setAlias: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  attachedID: LibraryItemID | undefined;
  setAttachedID: React.Dispatch<React.SetStateAction<LibraryItemID | undefined>>;
  createSchema: boolean;
  setCreateSchema: React.Dispatch<React.SetStateAction<boolean>>;
}

function TabInputOperation({
  oss,
  alias,
  setAlias,
  title,
  setTitle,
  comment,
  setComment,
  attachedID,
  setAttachedID,
  createSchema,
  setCreateSchema
}: TabInputOperationProps) {
  const baseFilter = useCallback((item: ILibraryItem) => !oss.schemas.includes(item.id), [oss]);
  const library = useLibrary();
  const sortedItems = useMemo(() => sortItemsForOSS(oss, library.items), [oss, library.items]);

  useEffect(() => {
    if (createSchema) {
      setAttachedID(undefined);
    }
  }, [createSchema, setAttachedID]);

  return (
    <AnimateFade className='cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        value={title}
        onChange={event => setTitle(event.target.value)}
        disabled={attachedID !== undefined}
      />
      <div className='flex gap-6'>
        <TextInput
          id='operation_alias'
          label='Сокращение'
          className='w-[16rem]'
          value={alias}
          onChange={event => setAlias(event.target.value)}
          disabled={attachedID !== undefined}
        />

        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          value={comment}
          onChange={event => setComment(event.target.value)}
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
            onClick={() => setAttachedID(undefined)}
            disabled={attachedID == undefined}
          />
        </div>
        <Checkbox
          value={createSchema}
          setValue={setCreateSchema}
          label='Создать новую схему'
          titleHtml='Создать пустую схему для загрузки'
        />
      </div>
      {!createSchema ? (
        <PickSchema
          items={sortedItems}
          value={attachedID}
          itemType={LibraryItemType.RSFORM}
          onSelectValue={setAttachedID}
          rows={8}
          baseFilter={baseFilter}
        />
      ) : null}
    </AnimateFade>
  );
}

export default TabInputOperation;
