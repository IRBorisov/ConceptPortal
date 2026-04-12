'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { OperationType, type OssLayout } from '@/domain/library';
import { useDialogsStore } from '@/stores/dialogs';

import { type DeleteOperationDTO, schemaDeleteOperation } from '../backend/types';
import { useDeleteOperation } from '../backend/use-delete-operation';
import { useOss } from '../backend/use-oss';

export interface DlgDeleteOperationProps {
  ossID: number;
  targetID: number;
  layout: OssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteOperation() {
  const { ossID, targetID, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteOperationProps);
  const { deleteOperation } = useDeleteOperation();

  const { schema: oss } = useOss({ itemID: ossID });
  const target = oss.operationByID.get(targetID)!;

  const shouldDeleteSchema =
    (target.operation_type === OperationType.INPUT && !target.is_import && !target.has_additions) ||
    (target.operation_type === OperationType.SYNTHESIS && !target.has_additions);

  const form = useForm({
    defaultValues: {
      target: targetID,
      layout: layout,
      keep_constituents: false,
      delete_schema: shouldDeleteSchema
    } as DeleteOperationDTO,
    validators: {
      onChange: schemaDeleteOperation
    },
    onSubmit: async ({ value }) => {
      await deleteOperation({ itemID: ossID, data: value, beforeUpdate: beforeDelete });
    }
  });

  const deleteSchema = useStore(form.store, state => state.values.delete_schema);

  return (
    <ModalForm
      overflowVisible
      header='Удаление операции'
      submitText='Подтвердить удаление'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-140 pb-3 px-6 cc-column select-none'
      helpTopic={HelpTopic.CC_PROPAGATION}
    >
      <TextInput disabled dense noBorder id='operation_alias' label='Операция' value={target.alias} />
      <form.Field name='delete_schema'>
        {field => (
          <Checkbox
            label='Удалить схему'
            titleHtml={
              (target.operation_type === OperationType.INPUT && target.is_import) || target.result === null
                ? 'Привязанную схему нельзя удалить'
                : 'Удалить схему вместе с операцией'
            }
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={(target.operation_type === OperationType.INPUT && target.is_import) || target.result === null}
          />
        )}
      </form.Field>
      <form.Field name='keep_constituents'>
        {field => (
          <Checkbox
            label='Сохранить наследованные конституенты'
            titleHtml='Наследованные конституенты <br/>превратятся в дописанные'
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={target.result === null}
          />
        )}
      </form.Field>
      {deleteSchema ? (
        <div className='text-destructive'>
          <b>Внимание!</b> Будет также удалена связанная схема
        </div>
      ) : null}
    </ModalForm>
  );
}
