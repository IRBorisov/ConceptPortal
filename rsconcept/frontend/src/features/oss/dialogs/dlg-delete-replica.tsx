'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { type OssLayout } from '@/domain/library';
import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type DeleteReplicaDTO, schemaDeleteReplica } from '../backend/types';
import { useDeleteReplica } from '../backend/use-delete-replica';
import { useOss } from '../backend/use-oss';

export interface DlgDeleteReplicaProps {
  ossID: number;
  targetID: number;
  layout: OssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteReplica() {
  const tx = useTx();
  const { ossID, targetID, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteReplicaProps);
  const { deleteReplica: deleteReference } = useDeleteReplica();

  const { schema } = useOss({ itemID: ossID });
  const target = schema.operationByID.get(targetID)!;

  const defaultValues: DeleteReplicaDTO = {
    target: targetID,
    layout: layout,
    keep_constituents: false,
    keep_connections: false
  };
  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaDeleteReplica
    },
    onSubmit: async ({ value }) => {
      await deleteReference({ itemID: ossID, data: value, beforeUpdate: beforeDelete });
    }
  });

  const keep_connections = useStore(form.store, state => state.values.keep_connections);

  return (
    <ModalForm
      overflowVisible
      header={tx('ui.oss.deleteReplica.header')}
      submitText={tx('semantic.action.delete')}
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
        label={tx('semantic.term.operation')}
        value={target.alias}
      />
      <form.Field name='keep_connections'>
        {field => (
          <Checkbox
            label={tx('ui.oss.deleteReplica.relinkArgs')}
            title={tx('ui.oss.deleteReplica.relinkArgsHint')}
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={target.result === null}
          />
        )}
      </form.Field>
      <form.Field name='keep_constituents'>
        {field => (
          <Checkbox
            label={tx('ui.oss.keepInherited')}
            title={tx('ui.oss.keepInheritedHint')}
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={target.result === null || keep_connections}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
