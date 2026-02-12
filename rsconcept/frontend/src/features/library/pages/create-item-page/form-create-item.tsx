'use client';

import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

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

export function FormCreateItem() {
  const { user } = useAuthSuspense();
  const router = useConceptNavigation();
  const { createItem, isPending, reset: clearServerError } = useCreateItem();
  const { items } = useLibrary();

  const searchLocation = useLibrarySearchStore(state => state.location);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);

  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    control,
    formState: { errors }
  } = useForm<CreateLibraryItemDTO>({
    resolver: zodResolver(schemaCreateLibraryItem),
    defaultValues: {
      item_type: LibraryItemType.RSFORM,
      access_policy: AccessPolicy.PUBLIC,
      visible: true,
      read_only: false,
      location:
        !!searchLocation && !searchLocation.startsWith(LocationHead.LIBRARY) ?
          searchLocation : LocationHead.USER
    },
    mode: 'onChange'
  });
  const itemType = useWatch({ control, name: 'item_type' });
  const file = useWatch({ control, name: 'file' });
  const inputRef = useRef<HTMLInputElement | null>(null);

  function resetErrors() {
    clearServerError();
    clearErrors();
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
      setValue('file', event.target.files[0]);
      setValue('fileName', event.target.files[0].name, { shouldValidate: true });
    } else {
      setValue('file', undefined);
      setValue('fileName', undefined);
    }
  }

  function handleItemTypeChange(value: LibraryItemType) {
    if (value !== LibraryItemType.RSFORM) {
      setValue('file', undefined);
      setValue('fileName', undefined);
    }
    if (value !== LibraryItemType.RSMODEL) {
      setValue('schema', undefined);
    }
    setValue('item_type', value, { shouldValidate: true });
  }

  function onSubmit(data: CreateLibraryItemDTO) {
    return createItem(data).then(newItem => {
      setSearchLocation(data.location);
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

  return (
    <form
      className='cc-column w-140 mx-auto px-6 py-3'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <h1 className='select-none relative'>
        {itemType == LibraryItemType.RSFORM ? (
          <>
            <Controller
              control={control}
              name='file'
              render={() => (
                <input
                  id='schema_file'
                  ref={inputRef}
                  type='file'
                  aria-hidden
                  className='hidden'
                  accept={EXTEOR_TRS_FILE}
                  onChange={handleFileChange}
                />
              )}
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

      <TextInput
        id='schema_title'
        {...register('title')}
        label='Название'
        placeholder={file && 'Загрузить из файла'}
        error={errors.title}
      />

      <div className='flex justify-between gap-3'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          placeholder={file && 'Загрузить из файла'}
          className='w-84'
          error={errors.alias}
        />
        <div className='flex flex-col items-center gap-2'>
          <Label text='Что создать' className='self-center select-none' />
          <Controller
            control={control}
            name='item_type'
            render={({ field }) => (
              <SelectItemType
                value={field.value ?? LibraryItemType.RSFORM} //
                onChange={handleItemTypeChange}
              />
            )}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label text='Доступ' className='self-center select-none' />
          <div className='ml-auto cc-icons'>
            <Controller
              control={control}
              name='access_policy'
              render={({ field }) => (
                <SelectAccessPolicy
                  value={field.value ?? AccessPolicy.PUBLIC} //
                  onChange={field.onChange}
                  stretchLeft
                />
              )}
            />
            <Controller
              control={control}
              name='visible'
              render={({ field }) => (
                <MiniButton
                  title={field.value ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
                  aria-label='Переключатель отображения библиотеки'
                  icon={<IconItemVisibility value={field.value ?? true} />}
                  onClick={() => field.onChange(!field.value)}
                />
              )}
            />
          </div>
        </div>
      </div>

      {itemType === LibraryItemType.RSMODEL ? (
        <div>
          <Label text='Концептуальная схема' />
          <Controller
            control={control}
            name='schema'
            render={({ field }) => (
              <PickSchema
                items={items}
                itemType={LibraryItemType.RSFORM}
                value={field.value ?? null}
                onChange={field.onChange}
                rows={6}
                className='mt-2'
                error={errors.schema}
              />
            )}
          />
        </div>
      ) : null}

      <Controller
        control={control}
        name='location'
        render={({ field }) => (
          <PickLocation
            value={field.value ?? ''} //
            rows={2}
            onChange={field.onChange}
            error={errors.location}
          />
        )}
      />

      <TextArea
        id='schema_comment'
        {...register('description')}
        label='Описание'
        placeholder={file && 'Загрузить из файла'}
        error={errors.description}
      />

      <div className='flex justify-around gap-6 py-3'>
        <SubmitButton
          text={itemType === LibraryItemType.RSMODEL ? 'Создать модель' : 'Создать схему'}
          loading={isPending} className='min-w-40'
          disabled={itemType === LibraryItemType.RSMODEL && !user.is_staff}
        />
        <Button text='Отмена' className='min-w-40' onClick={handleCancel} />
      </div>
    </form>
  );
}
