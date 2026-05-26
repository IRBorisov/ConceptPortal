'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useTx } from '@/i18n';
import { OperationType, type OssLayout } from '@rsconcept/domain/library';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
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
  const tx = useTx();
  const { ossID, targetID, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteOperationProps);
  const { deleteOperation } = useDeleteOperation();

  const { schema: oss } = useOss({ itemID: ossID });
  const target = oss.operationByID.get(targetID)!;

  const shouldDeleteSchema =
    (target.operation_type === OperationType.INPUT && !target.is_import && !target.has_additions) ||
    (target.operation_type === OperationType.SYNTHESIS && !target.has_additions);

  const defaultValues: DeleteOperationDTO = {
    target: targetID,
    layout: layout,
    keep_constituents: false,
    delete_schema: shouldDeleteSchema
  };
  const form = useForm({
    defaultValues,
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
      header={tx('tx.operation.delete')}
      submitText={tx('tx.general.delete')}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-140 pb-3 px-6 cc-column select-none'
      helpTopic={HelpTopic.CC_PROPAGATION}
    >
      <TextInput disabled dense noBorder id='operation_alias' label={tx('tx.operation')} value={target.alias} />
      <form.Field name='delete_schema'>
        {field => (
          <Checkbox
            label={tx('tx.schema.delete')}
            title={
              (target.operation_type === OperationType.INPUT && target.is_import) || target.result === null
                ? tx('tx.operation.delete.attached.blocked')
                : tx('tx.operation.delete.attached')
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
            label={tx('tx.operation.delete.keepInherited')}
            title={tx('tx.operation.delete.keepInherited.hint')}
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={target.result === null}
          />
        )}
      </form.Field>
      {deleteSchema ? (
        <div className='text-destructive'>
          <b>{tx('tx.general.attention')}</b> {tx('tx.operation.delete.attached.hint')}
        </div>
      ) : null}
    </ModalForm>
  );
}
