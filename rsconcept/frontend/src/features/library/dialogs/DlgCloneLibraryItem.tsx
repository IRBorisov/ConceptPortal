'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/Control';
import { Checkbox, Label, TextArea, TextInput } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';

import { AccessPolicy, type ICloneLibraryItemDTO, type ILibraryItem, schemaCloneLibraryItem } from '../backend/types';
import { useCloneItem } from '../backend/useCloneItem';
import { IconItemVisibility } from '../components/IconItemVisibility';
import { PickLocation } from '../components/PickLocation';
import { SelectAccessPolicy } from '../components/SelectAccessPolicy';
import { cloneTitle } from '../models/libraryAPI';

export interface DlgCloneLibraryItemProps {
  base: ILibraryItem;
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
  } = useForm<ICloneLibraryItemDTO>({
    resolver: zodResolver(schemaCloneLibraryItem),
    defaultValues: {
      id: base.id,
      item_type: base.item_type,
      title: cloneTitle(base),
      alias: base.alias,
      comment: base.comment,
      visible: true,
      read_only: false,
      access_policy: AccessPolicy.PUBLIC,
      location: initialLocation,
      items: []
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  function onSubmit(data: ICloneLibraryItemDTO) {
    return cloneItem(data).then(newSchema => router.pushAsync({ path: urls.schema(newSchema.id), force: true }));
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
        label='Полное название'
        {...register('title')}
        error={errors.title}
      />

      <div className='flex justify-between gap-3'>
        <TextInput id='dlg_alias' label='Сокращение' className='w-64' {...register('alias')} error={errors.alias} />
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

      <Controller
        control={control}
        name='location'
        render={({ field }) => (
          <PickLocation value={field.value} rows={2} onChange={field.onChange} error={errors.location} />
        )}
      />

      <TextArea id='dlg_comment' {...register('comment')} label='Описание' rows={4} error={errors.comment} />

      {selected.length > 0 ? (
        <Controller
          control={control}
          name='items'
          render={({ field }) => (
            <Checkbox
              id='dlg_only_selected'
              label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
              value={field.value.length > 0}
              onChange={value => field.onChange(value ? selected : [])}
            />
          )}
        />
      ) : null}
    </ModalForm>
  );
}
