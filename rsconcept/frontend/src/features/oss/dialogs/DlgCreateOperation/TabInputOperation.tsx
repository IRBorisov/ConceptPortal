'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { MiniButton } from '@/components/Control';
import { IconReset } from '@/components/Icons';
import { Checkbox, Label, TextArea, TextInput } from '@/components/Input';
import { useLibrary } from '@/features/library/backend/useLibrary';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/features/library/models/library';
import { IOperationSchema } from '@/features/oss/models/oss';
import { sortItemsForOSS } from '@/features/oss/models/ossAPI';
import PickSchema from '@/features/rsform/components/PickSchema';

import { IOperationCreateDTO } from '../../backend/api';

interface TabInputOperationProps {
  oss: IOperationSchema;
}

function TabInputOperation({ oss }: TabInputOperationProps) {
  const { items: libraryItems } = useLibrary();
  const sortedItems = sortItemsForOSS(oss, libraryItems);

  const {
    register,
    control,
    setValue,
    formState: { errors }
  } = useFormContext<IOperationCreateDTO>();
  const createSchema = useWatch({ control, name: 'create_schema' });

  function baseFilter(item: ILibraryItem) {
    return !oss.schemas.includes(item.id);
  }

  function handleChangeCreateSchema(value: boolean) {
    if (value) {
      setValue('item_data.result', null);
    }
    setValue('create_schema', value);
  }

  function handleSetInput(value: LibraryItemID) {
    const schema = libraryItems.find(item => item.id === value);
    if (!schema) {
      return;
    }
    setValue('item_data.result', value);
    setValue('create_schema', false);
    setValue('item_data.alias', schema.alias);
    setValue('item_data.title', schema.title);
    setValue('item_data.comment', schema.comment);
  }

  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title' //
        label='Полное название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <div className='flex gap-6'>
        <TextInput
          id='operation_alias' //
          label='Сокращение'
          className='w-[16rem]'
          {...register('item_data.alias')}
          error={errors.item_data?.alias}
        />

        <TextArea
          id='operation_comment' //
          label='Описание'
          noResize
          rows={3}
          {...register('item_data.comment')}
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
            onClick={() => setValue('item_data.result', null)}
          />
        </div>
        <Checkbox
          value={createSchema} //
          onChange={handleChangeCreateSchema}
          label='Создать новую схему'
        />
      </div>
      {!createSchema ? (
        <Controller
          control={control}
          name='item_data.result'
          render={({ field }) => (
            <PickSchema
              items={sortedItems}
              value={field.value}
              itemType={LibraryItemType.RSFORM}
              onChange={handleSetInput}
              rows={8}
              baseFilter={baseFilter}
            />
          )}
        />
      ) : null}
    </div>
  );
}

export default TabInputOperation;
