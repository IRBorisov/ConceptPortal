'use client';

import { useCallback, useEffect } from 'react';

import { IconReset } from '@/components/Icons';
import PickSchema from '@/components/select/PickSchema';
import Checkbox from '@/components/ui/Checkbox';
import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import { IOperationSchema } from '@/models/oss';
import { limits, patterns } from '@/utils/constants';

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
  syncText: boolean;
  setSyncText: React.Dispatch<React.SetStateAction<boolean>>;
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
  syncText,
  setSyncText,
  createSchema,
  setCreateSchema
}: TabInputOperationProps) {
  const baseFilter = useCallback((item: ILibraryItem) => !oss.schemas.includes(item.id), [oss]);

  useEffect(() => {
    if (createSchema) {
      setAttachedID(undefined);
      setSyncText(true);
    }
  }, [createSchema, setAttachedID, setSyncText]);

  return (
    <AnimateFade className='cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        value={title}
        onChange={event => setTitle(event.target.value)}
        disabled={syncText && attachedID !== undefined}
      />
      <div className='flex gap-6'>
        <FlexColumn>
          <TextInput
            id='operation_alias'
            label='Сокращение'
            className='w-[14rem]'
            pattern={patterns.library_alias}
            title={`не более ${limits.library_alias_len} символов`}
            value={alias}
            onChange={event => setAlias(event.target.value)}
            disabled={syncText && attachedID !== undefined}
          />
          <Checkbox
            value={syncText}
            setValue={setSyncText}
            label='Синхронизировать текст'
            title='Брать текст из концептуальной схемы'
          />
        </FlexColumn>

        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          value={comment}
          onChange={event => setComment(event.target.value)}
          disabled={syncText && attachedID !== undefined}
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
          value={attachedID} // prettier: split-line
          onSelectValue={setAttachedID}
          rows={8}
          baseFilter={baseFilter}
        />
      ) : null}
    </AnimateFade>
  );
}

export default TabInputOperation;
