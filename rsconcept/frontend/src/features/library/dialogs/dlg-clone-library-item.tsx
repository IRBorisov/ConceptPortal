'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { Checkbox, Label, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { AccessPolicy, type CloneLibraryItemDTO, type LibraryItem, schemaCloneLibraryItem } from '../backend/types';
import { useCloneItem } from '../backend/use-clone-item';
import { IconItemVisibility } from '../components/icon-item-visibility';
import { PickLocation } from '../components/pick-location';
import { SelectAccessPolicy } from '../components/select-access-policy';
import { cloneTitle } from '../models/library-api';

export interface DlgCloneLibraryItemProps {
  base: LibraryItem;
  initialLocation: string;
  selected: number[];
  totalCount: number;
}

export function DlgCloneLibraryItem() {
  const { base, initialLocation, selected, totalCount } = useDialogsStore(
    state => state.props as DlgCloneLibraryItemProps
  );
  const router = useConceptNavigation();
  const { cloneItem } = useCloneItem();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<CloneLibraryItemDTO>({
    resolver: zodResolver(schemaCloneLibraryItem),
    defaultValues: {
      item_data: {
        title: cloneTitle(base),
        alias: base.alias,
        description: base.description,
        visible: true,
        access_policy: AccessPolicy.PUBLIC,
        location: initialLocation
      },
      items: []
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  function onSubmit(data: CloneLibraryItemDTO) {
    return cloneItem({
      itemID: base.id,
      data: data
    }).then(newSchema => router.pushAsync({ path: urls.schema(newSchema.id), force: true }));
  }

  return (
    <ModalForm
      header='Создание копии концептуальной схемы'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='px-6 py-2 cc-column h-fit w-120'
    >
      <TextInput
        id='dlg_full_name' //
        label='Название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />

      <div className='flex justify-between gap-3'>
        <TextInput
          id='dlg_alias'
          label='Сокращение'
          className='w-64'
          {...register('item_data.alias')}
          error={errors.item_data?.alias}
        />
        <div className='flex flex-col gap-2'>
          <Label text='Доступ' className='self-center select-none' />
          <div className='ml-auto cc-icons'>
            <Controller
              control={control}
              name='item_data.access_policy'
              render={({ field }) => (
                <SelectAccessPolicy
                  value={field.value ?? 'public'} //
                  onChange={field.onChange}
                  stretchLeft
                />
              )}
            />
            <Controller
              control={control}
              name='item_data.visible'
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

      <Controller
        control={control}
        name='item_data.location'
        render={({ field }) => (
          <PickLocation
            value={field.value ?? ''} //
            rows={2}
            onChange={field.onChange}
            error={errors.item_data?.location}
          />
        )}
      />

      <TextArea
        id='dlg_comment'
        {...register('item_data.description')}
        label='Описание'
        rows={4}
        error={errors.item_data?.description}
      />

      {selected.length > 0 ? (
        <Controller
          control={control}
          name='items'
          render={({ field }) => (
            <Checkbox
              id='dlg_only_selected'
              label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
              value={field.value ? field.value.length > 0 : false}
              onChange={value => field.onChange(value ? selected : [])}
            />
          )}
        />
      ) : null}
    </ModalForm>
  );
}
