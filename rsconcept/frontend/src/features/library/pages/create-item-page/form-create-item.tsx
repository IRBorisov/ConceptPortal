'use client';

import { useRef } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { urls, useConceptNavigation } from '@/app';

import { Button, MiniButton, SubmitButton } from '@/components/control';
import { IconDownload } from '@/components/icons';
import { Label, TextArea, TextInput } from '@/components/input';
import { EXTEOR_TRS_FILE } from '@/utils/constants';

import {
  AccessPolicy,
  type CreateLibraryItemDTO,
  LibraryItemType,
  schemaCreateLibraryItem
} from '../../backend/types';
import { useCreateItem } from '../../backend/use-create-item';
import { useLibrary } from '../../backend/use-library';
import { IconItemVisibility } from '../../components/icon-item-visibility';
import { PickLocation } from '../../components/pick-location';
import { PickSchema } from '../../components/pick-schema';
import { SelectAccessPolicy } from '../../components/select-access-policy';
import { SelectItemType } from '../../components/select-item-type';
import { LocationHead } from '../../models/library';
import { useLibrarySearchStore } from '../../stores/library-search';

interface FormCreateItemProps {
  modelFrom?: number;
}

export function FormCreateItem({ modelFrom }: FormCreateItemProps) {
  const router = useConceptNavigation();
  const { createItem, isPending, reset: clearServerError } = useCreateItem();
  const { items } = useLibrary();
  const schemaItem = modelFrom ? items.find(item => item.id === modelFrom) : null;

  const searchLocation = useLibrarySearchStore(state => state.location);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);

  const form = useForm({
    defaultValues: {
      item_type: modelFrom ? LibraryItemType.RSMODEL : LibraryItemType.RSFORM,
      access_policy: AccessPolicy.PUBLIC,
      visible: true,
      read_only: false,
      schema: modelFrom,
      title: schemaItem ? `Модель ${schemaItem.title}` : undefined,
      alias: schemaItem ? `M${schemaItem.alias}` : undefined,
      location:
        schemaItem ? schemaItem.location :
          !!searchLocation && !searchLocation.startsWith(LocationHead.LIBRARY) ?
            searchLocation : LocationHead.USER,
      description: '',
      file: undefined,
      fileName: undefined
    } as CreateLibraryItemDTO,
    validators: {
      onChange: schemaCreateLibraryItem
    },
    onSubmit: async ({ value }) => {
      await createItem(value).then(newItem => {
        setSearchLocation(value.location);
        switch (newItem.item_type) {
          case LibraryItemType.RSFORM:
            router.push({ path: urls.schema(newItem.id), force: true });
            break;
          case LibraryItemType.OSS:
            router.push({ path: urls.oss(newItem.id), force: true });
            break;
          case LibraryItemType.RSMODEL:
            router.push({ path: urls.model(newItem.id), force: true });
            break;
        }
      });
    }
  });

  const itemType = useStore(form.store, state => state.values.item_type);
  const file = useStore(form.store, state => state.values.file);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function resetErrors() {
    clearServerError();
  }

  function handleCancel() {
    if (router.canBack()) {
      router.back();
    } else {
      router.push({ path: urls.library });
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const f = event.target.files[0];
      form.setFieldValue('file', f);
      form.setFieldValue('fileName', f.name);
    } else {
      form.setFieldValue('file', undefined);
      form.setFieldValue('fileName', undefined);
    }
  }

  function handleItemTypeChange(value: LibraryItemType) {
    if (value !== LibraryItemType.RSFORM) {
      form.setFieldValue('file', undefined);
      form.setFieldValue('fileName', undefined);
    }
    if (value !== LibraryItemType.RSMODEL) {
      form.setFieldValue('schema', undefined);
    }
    form.setFieldValue('item_type', value);
  }

  return (
    <form
      className='cc-column w-140 mx-auto px-6 py-3'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      onChange={resetErrors}
    >
      <h1 className='select-none relative'>
        {itemType == LibraryItemType.RSFORM ? (
          <>
            <input
              id='schema_file'
              ref={inputRef}
              type='file'
              aria-hidden
              className='hidden'
              accept={EXTEOR_TRS_FILE}
              onChange={handleFileChange}
            />
            <MiniButton
              title='Загрузить из Экстеор'
              className='absolute top-0 right-0'
              icon={<IconDownload size='1.25rem' className='icon-primary' />}
              onClick={() => inputRef.current?.click()}
            />
          </>
        ) : null}
        {itemType === LibraryItemType.RSMODEL ? 'Создание модели' : 'Создание схемы'}
      </h1>

      {file ? <Label className='text-wrap' text={`Загружен файл: ${file.name}`} /> : null}

      <form.Field name='title'>
        {field => (
          <TextInput
            id='schema_title'
            label='Название'
            placeholder={file ? 'Загрузить из файла' : undefined}
            value={field.state.value ?? ''}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <div className='flex justify-between gap-3'>
        <form.Field name='alias'>
          {field => (
            <TextInput
              id='schema_alias'
              label='Сокращение'
              placeholder={file ? 'Загрузить из файла' : undefined}
              className='w-84'
              value={field.state.value ?? ''}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <div className='flex flex-col items-center gap-2'>
          <Label text='Что создать' className='self-center select-none' />
          <form.Field name='item_type'>
            {field => (
              <SelectItemType
                value={field.state.value ?? LibraryItemType.RSFORM} //
                onChange={handleItemTypeChange}
              />
            )}
          </form.Field>
        </div>

        <div className='flex flex-col gap-2'>
          <Label text='Доступ' className='self-center select-none' />
          <div className='ml-auto cc-icons'>
            <form.Field name='access_policy'>
              {field => (
                <SelectAccessPolicy
                  value={field.state.value ?? AccessPolicy.PUBLIC} //
                  onChange={field.handleChange}
                  stretchLeft
                />
              )}
            </form.Field>
            <form.Field name='visible'>
              {field => (
                <MiniButton
                  title={field.state.value ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
                  aria-label='Переключатель отображения библиотеки'
                  icon={<IconItemVisibility value={field.state.value ?? true} />}
                  onClick={() => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>

      {itemType === LibraryItemType.RSMODEL ? (
        <div>
          <Label text='Концептуальная схема' />
          <form.Field name='schema'>
            {field => (
              <PickSchema
                items={items}
                itemType={LibraryItemType.RSFORM}
                value={field.state.value ?? null}
                onChange={field.handleChange}
                rows={6}
                className='mt-2'
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
        </div>
      ) : null}

      <form.Field name='location'>
        {field => (
          <PickLocation
            value={field.state.value ?? ''} //
            rows={2}
            onChange={field.handleChange}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Field name='description'>
        {field => (
          <TextArea
            id='schema_comment'
            label='Описание'
            placeholder={file ? 'Загрузить из файла' : undefined}
            value={field.state.value ?? ''}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <div className='flex justify-around gap-6 py-3'>
        <SubmitButton
          text={itemType === LibraryItemType.RSMODEL ? 'Создать модель' : 'Создать схему'}
          loading={isPending} className='min-w-40'
        />
        <Button text='Отмена' className='min-w-40' onClick={handleCancel} />
      </div>
    </form>
  );
}
