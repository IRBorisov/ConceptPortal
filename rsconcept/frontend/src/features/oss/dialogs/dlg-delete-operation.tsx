'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { OperationType, type OssLayout } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';
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
      header={tx('ui.oss.deleteOperation.header', 'Delete operation')}
      submitText={tx('ui.oss.deleteOperation.submit', 'Confirm deletion')}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-140 pb-3 px-6 cc-column select-none'
      helpTopic={HelpTopic.CC_PROPAGATION}
    >
      <TextInput
        disabled
        dense
        noBorder
        id='operation_alias'
        label={tx('ui.oss.deleteOperation.operationLabel', 'Operation')}
        value={target.alias}
      />
      <form.Field name='delete_schema'>
        {field => (
          <Checkbox
            label={tx('ui.oss.deleteOperation.deleteSchema', 'Delete schema')}
            title={
              (target.operation_type === OperationType.INPUT && target.is_import) || target.result === null
                ? tx('ui.oss.deleteOperation.deleteSchemaLocked', 'The linked schema cannot be deleted')
                : tx('ui.oss.deleteOperation.deleteSchemaHint', 'Delete the schema together with the operation')
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
            label={tx('ui.oss.deleteOperation.keepInherited', 'Keep inherited constituents')}
            title={tx(
              'ui.oss.deleteOperation.keepInheritedHint',
              'Inherited constituents\nwill become appended ones'
            )}
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={target.result === null}
          />
        )}
      </form.Field>
      {deleteSchema ? (
        <div className='text-destructive'>
          <b>{tx('ui.oss.deleteOperation.warningAttention', 'Warning!')}</b>{' '}
          {tx('ui.oss.deleteOperation.warningRelatedSchema', 'The linked schema will also be deleted')}
        </div>
      ) : null}
    </ModalForm>
  );
}
