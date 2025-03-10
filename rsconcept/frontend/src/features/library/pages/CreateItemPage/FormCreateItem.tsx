'use client';

import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

import { Button, MiniButton, SubmitButton } from '@/components/Control';
import { IconDownload } from '@/components/Icons';
import { InfoError } from '@/components/InfoError';
import { Label, TextArea, TextInput } from '@/components/Input';
import { EXTEOR_TRS_FILE } from '@/utils/constants';

import {
  AccessPolicy,
  type ICreateLibraryItemDTO,
  LibraryItemType,
  schemaCreateLibraryItem
} from '../../backend/types';
import { useCreateItem } from '../../backend/useCreateItem';
import { IconItemVisibility } from '../../components/IconItemVisibility';
import { SelectAccessPolicy } from '../../components/SelectAccessPolicy';
import { SelectItemType } from '../../components/SelectItemType';
import { SelectLocationContext } from '../../components/SelectLocationContext';
import { SelectLocationHead } from '../../components/SelectLocationHead';
import { LocationHead } from '../../models/library';
import { combineLocation } from '../../models/libraryAPI';
import { useLibrarySearchStore } from '../../stores/librarySearch';

export function FormCreateItem() {
  const router = useConceptNavigation();
  const { user } = useAuthSuspense();
  const { createItem, isPending, error: serverError, reset: clearServerError } = useCreateItem();

  const searchLocation = useLibrarySearchStore(state => state.location);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);

  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    control,
    formState: { errors }
  } = useForm<ICreateLibraryItemDTO>({
    resolver: zodResolver(schemaCreateLibraryItem),
    defaultValues: {
      item_type: LibraryItemType.RSFORM,
      access_policy: AccessPolicy.PUBLIC,
      visible: true,
      read_only: false,
      location: !!searchLocation ? searchLocation : LocationHead.USER
    }
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
      setValue('fileName', '');
    }
  }

  function handleItemTypeChange(value: LibraryItemType) {
    if (value !== LibraryItemType.RSFORM) {
      setValue('file', undefined);
      setValue('fileName', '');
    }
    setValue('item_type', value, { shouldValidate: true });
  }

  function onSubmit(data: ICreateLibraryItemDTO) {
    return createItem(data).then(newItem => {
      setSearchLocation(data.location);
      if (newItem.item_type == LibraryItemType.RSFORM) {
        router.push({ path: urls.schema(newItem.id), force: true });
      } else {
        router.push({ path: urls.oss(newItem.id), force: true });
      }
    });
  }

  return (
    <form
      className='cc-fade-in cc-column min-w-120 max-w-120 mx-auto px-6 py-3'
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
                  style={{ display: 'none' }}
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
        Создание схемы
      </h1>

      {file ? <Label className='text-wrap' text={`Загружен файл: ${file.name}`} /> : null}

      <TextInput
        id='schema_title'
        {...register('title')}
        label='Полное название'
        placeholder={file && 'Загрузить из файла'}
        error={errors.title}
      />

      <div className='flex justify-between gap-3'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          placeholder={file && 'Загрузить из файла'}
          className='w-64'
          error={errors.alias}
        />
        <div className='flex flex-col items-center gap-2'>
          <Label text='Тип схемы' className='self-center select-none' />
          <Controller
            control={control}
            name='item_type'
            render={({ field }) => (
              <SelectItemType
                value={field.value} //
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
                  value={field.value} //
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
                  icon={<IconItemVisibility value={field.value} />}
                  onClick={() => field.onChange(!field.value)}
                />
              )}
            />
          </div>
        </div>
      </div>

      <TextArea
        id='schema_comment'
        {...register('comment')}
        label='Описание'
        placeholder={file && 'Загрузить из файла'}
        error={errors.comment}
      />

      <div className='flex justify-between gap-3 grow'>
        <div className='flex flex-col gap-2 min-w-28'>
          <Label text='Корень' />
          <Controller
            control={control} //
            name='location'
            render={({ field }) => (
              <SelectLocationHead
                value={field.value.substring(0, 2) as LocationHead}
                onChange={newValue => field.onChange(combineLocation(newValue, field.value.substring(3)))}
                excluded={!user.is_staff ? [LocationHead.LIBRARY] : []}
              />
            )}
          />
        </div>
        <Controller
          control={control} //
          name='location'
          render={({ field }) => (
            <SelectLocationContext
              value={field.value} //
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control} //
          name='location'
          render={({ field }) => (
            <TextArea
              id='location'
              label='Путь'
              rows={4}
              value={field.value.substring(3)}
              onChange={event => field.onChange(combineLocation(field.value.substring(0, 2), event.target.value))}
              error={errors.location}
            />
          )}
        />
      </div>

      <div className='flex justify-around gap-6 py-3'>
        <SubmitButton text='Создать схему' loading={isPending} className='min-w-40' />
        <Button text='Отмена' className='min-w-40' onClick={() => handleCancel()} />
      </div>
      {serverError ? <InfoError error={serverError} /> : null}
    </form>
  );
}
