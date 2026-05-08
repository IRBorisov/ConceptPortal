'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { AccessPolicy, type LibraryItem, LibraryItemType } from '@/domain/library';
import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { Checkbox, Label, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
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
  const tx = useTx();
  const { base, initialLocation, selected, totalCount } = useDialogsStore(
    state => state.props as DlgCloneLibraryItemProps
  );
  const router = useConceptNavigation();
  const { cloneItem } = useCloneItem();

  const defaultValues: CloneLibraryItemDTO = {
    item_data: {
      title: cloneTitle(base),
      alias: base.alias,
      description: base.description,
      visible: true,
      access_policy: AccessPolicy.PUBLIC,
      location: initialLocation
    },
    items: []
  };
  const form = useForm({
    defaultValues,
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
      header={base.item_type === LibraryItemType.RSFORM ? tx('tx.schema') : tx('tx.model')}
      submitText={tx('tx.general.create')}
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
            label={tx('tx.lib.title')}
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
              label={tx('tx.lib.alias')}
              className='w-64'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <div className='flex flex-col gap-2'>
          <Label text={tx('tx.lib.access')} className='self-center select-none' />
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
                  title={field.state.value ? tx('tx.lib.item.visibility.on') : tx('tx.lib.item.visibility.off')}
                  aria-label={tx('tx.lib.item.visibility.hint')}
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
            label={tx('tx.lib.description')}
            placeholder={tx('tx.lib.description.hint')}
            rows={5}
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
              label={tx('tx.cst.onlySelected', {
                n: selected.length,
                total: totalCount
              })}
              value={field.state.value ? field.state.value.length > 0 : false}
              onChange={value => field.handleChange(value ? selected : [])}
            />
          )}
        </form.Field>
      ) : null}
    </ModalForm>
  );
}
