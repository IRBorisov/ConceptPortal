'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';

import { urls, useConceptNavigation } from '@/app';
import { MiniButton } from '@/components/Control';
import { VisibilityIcon } from '@/components/DomainIcons';
import { Checkbox, Label, TextArea, TextInput } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useAuthSuspense } from '@/features/auth/backend/useAuth';
import { ICloneLibraryItemDTO, schemaCloneLibraryItem } from '@/features/library/backend/api';
import { useCloneItem } from '@/features/library/backend/useCloneItem';
import SelectAccessPolicy from '@/features/library/components/SelectAccessPolicy';
import SelectLocationContext from '@/features/library/components/SelectLocationContext';
import SelectLocationHead from '@/features/library/components/SelectLocationHead';
import { AccessPolicy, ILibraryItem, LocationHead } from '@/features/library/models/library';
import { cloneTitle, combineLocation } from '@/features/library/models/libraryAPI';
import { useDialogsStore } from '@/stores/dialogs';

import { ConstituentaID } from '../models/rsform';

export interface DlgCloneLibraryItemProps {
  base: ILibraryItem;
  initialLocation: string;
  selected: ConstituentaID[];
  totalCount: number;
}

function DlgCloneLibraryItem() {
  const { base, initialLocation, selected, totalCount } = useDialogsStore(
    state => state.props as DlgCloneLibraryItemProps
  );
  const router = useConceptNavigation();
  const { user } = useAuthSuspense();
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
      items: undefined
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  function onSubmit(data: ICloneLibraryItemDTO) {
    return cloneItem(data).then(newSchema => router.push(urls.schema(newSchema.id)));
  }

  return (
    <ModalForm
      header='Создание копии концептуальной схемы'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className={clsx('px-6 py-2', 'cc-column', 'max-h-full w-[30rem]')}
    >
      <TextInput
        id='dlg_full_name' //
        label='Полное название'
        {...register('title')}
        error={errors.title}
      />
      <div className='flex justify-between gap-3'>
        <TextInput
          id='dlg_alias'
          label='Сокращение'
          className='w-[16rem]'
          {...register('alias')}
          error={errors.alias}
        />
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
                  icon={<VisibilityIcon value={field.value} />}
                  onClick={() => field.onChange(!field.value)}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div className='flex justify-between gap-3'>
        <div className='flex flex-col gap-2 w-[7rem] h-min'>
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
              id='dlg_location'
              label='Путь'
              rows={3}
              value={field.value.substring(3)}
              onChange={event => field.onChange(combineLocation(field.value.substring(0, 2), event.target.value))}
              error={errors.location}
            />
          )}
        />
      </div>

      <TextArea id='dlg_comment' {...register('comment')} label='Описание' error={errors.comment} />

      {selected.length > 0 ? (
        <Controller
          control={control}
          name='items'
          render={({ field }) => (
            <Checkbox
              id='dlg_only_selected'
              label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
              value={field.value !== undefined}
              onChange={value => field.onChange(value ? selected : undefined)}
            />
          )}
        />
      ) : null}
    </ModalForm>
  );
}

export default DlgCloneLibraryItem;
