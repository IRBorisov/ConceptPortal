'use client';

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';

import { useTx } from '@/i18n';
import { type OssLayout } from '@rsconcept/domain/library';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';

import { type DeleteReplicaDTO, schemaDeleteReplica } from '../backend/types';
import { useDeleteReplica } from '../backend/use-delete-replica';
import { useOss } from '../backend/use-oss';

import { useOssDialogsStore } from './oss-dialog-store';


export interface DlgDeleteReplicaProps {
  ossID: number;
  targetID: number;
  layout: OssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteReplica() {
  const tx = useTx();
  const { ossID, targetID, layout, beforeDelete } = useOssDialogsStore(state => state.props as DlgDeleteReplicaProps);
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

  const keep_connections = useSelector(form.store, state => state.values.keep_connections);

  return (
    <ModalForm
      overflowVisible
      header={tx('tx.oss.replica.delete')}
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
      <form.Field name='keep_connections'>
        {field => (
          <Checkbox
            label={tx('tx.oss.replica.delete.keepConnections')}
            title={tx('tx.oss.replica.delete.keepConnections.hint')}
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={target.result === null}
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
            disabled={target.result === null || keep_connections}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
