'use client';

import { useForm } from '@tanstack/react-form';

import { type LibraryItem, LibraryItemType } from '@/features/library';
import { useLibrary } from '@/features/library/backend/use-library';
import { PickSchema } from '@/features/library/components/pick-schema';

import { MiniButton } from '@/components/control';
import { IconReset } from '@/components/icons';
import { Label } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type OssLayout, schemaUpdateInput, type UpdateInputDTO } from '../backend/types';
import { useUpdateInput } from '../backend/use-update-input';
import { type Operation, type OperationSchema } from '../models/oss';
import { sortItemsForOSS } from '../models/oss-api';

export interface DlgChangeInputSchemaProps {
  oss: OperationSchema;
  target: Operation;
  layout: OssLayout;
}

export function DlgChangeInputSchema() {
  const { oss, target, layout } = useDialogsStore(state => state.props as DlgChangeInputSchemaProps);
  const { updateInput } = useUpdateInput();

  const form = useForm({
    defaultValues: {
      target: target.id,
      layout: layout,
      input: target.result
    } satisfies UpdateInputDTO,
    validators: {
      onChange: schemaUpdateInput
    },
    onSubmit: async ({ value }) => {
      await updateInput({ itemID: oss.id, data: value });
    }
  });

  const { items } = useLibrary();
  const sortedItems = sortItemsForOSS(oss, items);

  function baseFilter(item: LibraryItem) {
    return !oss.schemas.includes(item.id) || item.id === target.result;
  }

  return (
    <ModalForm
      overflowVisible
      header='Выбор концептуальной схемы'
      submitText='Подтвердить выбор'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-140 pb-3 px-6 cc-column'
    >
      <div className='flex justify-between gap-3 items-center'>
        <div className='flex gap-3'>
          <Label text='Загружаемая концептуальная схема' />
          <MiniButton
            title='Сбросить выбор схемы'
            noPadding
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={() => form.setFieldValue('input', null)}
          />
        </div>
      </div>
      <form.Field name='input'>
        {field => (
          <PickSchema
            items={sortedItems}
            itemType={LibraryItemType.RSFORM}
            value={field.state.value ?? null}
            onChange={field.handleChange}
            rows={14}
            baseFilter={baseFilter}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
