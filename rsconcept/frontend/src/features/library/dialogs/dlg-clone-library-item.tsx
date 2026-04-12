'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { urls, useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { Checkbox, Label, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { AccessPolicy, type LibraryItem, LibraryItemType } from '@/domain/library';
import { useDialogsStore } from '@/stores/dialogs';

import { type CloneLibraryItemDTO, schemaCloneLibraryItem } from '../backend/types';
import { useCloneItem } from '../backend/use-clone-item';
import { IconItemVisibility } from '../components/icon-item-visibility';
import { PickLocation } from '../components/pick-location';
import { SelectAccessPolicy } from '../components/select-access-policy';
import { cloneTitle } from '../models/utils';

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

  const form = useForm({
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
    } as CloneLibraryItemDTO,
    validators: {
      onChange: schemaCloneLibraryItem
    },
    onSubmit: async ({ value }) => {
      await cloneItem({
        itemID: base.id,
        data: value
      }).then(newItem => {
        const path =
          'item_type' in newItem && newItem.item_type === LibraryItemType.RSMODEL
            ? urls.model(newItem.id)
            : urls.schema(newItem.id);
        return router.pushAsync({ path, force: true });
      });
    }
  });

  const values = useStore(form.store, state => state.values);
  const isValid = schemaCloneLibraryItem.safeParse(values).success;

  return (
    <ModalForm
      header='Создание копии концептуальной схемы'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='px-6 py-2 cc-column h-fit w-120'
    >
      <form.Field name='item_data.title'>
        {field => (
          <TextInput
            id='dlg_full_name' //
            label='Название'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <div className='flex justify-between gap-3'>
        <form.Field name='item_data.alias'>
          {field => (
            <TextInput
              id='dlg_alias'
              label='Сокращение'
              className='w-64'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <div className='flex flex-col gap-2'>
          <Label text='Доступ' className='self-center select-none' />
          <div className='ml-auto cc-icons'>
            <form.Field name='item_data.access_policy'>
              {field => (
                <SelectAccessPolicy
                  value={field.state.value ?? AccessPolicy.PUBLIC} //
                  onChange={(v: AccessPolicy) => field.handleChange(v)}
                  stretchLeft
                />
              )}
            </form.Field>
            <form.Field name='item_data.visible'>
              {field => (
                <MiniButton
                  title={field.state.value ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
                  aria-label='Переключатель отображения библиотеки'
                  icon={<IconItemVisibility value={field.state.value ?? true} />}
                  onClick={() => field.handleChange(!(field.state.value ?? false))}
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>

      <form.Field name='item_data.location'>
        {field => (
          <PickLocation
            value={field.state.value ?? ''}
            rows={2}
            onChange={field.handleChange}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Field name='item_data.description'>
        {field => (
          <TextArea
            id='dlg_comment'
            label='Описание'
            rows={4}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      {selected.length > 0 && base.item_type === LibraryItemType.RSFORM ? (
        <form.Field name='items'>
          {field => (
            <Checkbox
              id='dlg_only_selected'
              label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
              value={field.state.value ? field.state.value.length > 0 : false}
              onChange={value => field.handleChange(value ? selected : [])}
            />
          )}
        </form.Field>
      ) : null}
    </ModalForm>
  );
}
