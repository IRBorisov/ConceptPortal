'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type DeleteReplicaDTO, type OssLayout, schemaDeleteReplica } from '../backend/types';
import { useDeleteReplica } from '../backend/use-delete-replica';
import { useOss } from '../backend/use-oss';

export interface DlgDeleteReplicaProps {
  ossID: number;
  targetID: number;
  layout: OssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteReplica() {
  const { ossID, targetID, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteReplicaProps);
  const { deleteReplica: deleteReference } = useDeleteReplica();

  const { schema } = useOss({ itemID: ossID });
  const target = schema.operationByID.get(targetID)!;

  const form = useForm({
    defaultValues: {
      target: targetID,
      layout: layout,
      keep_constituents: false,
      keep_connections: false
    } as DeleteReplicaDTO,
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
      header='Удаление реплики'
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
      <form.Field name='keep_connections'>
        {field => (
          <Checkbox
            label='Переадресовать связи на оригинал'
            titleHtml='Связи аргументов будут перенаправлены на оригинал реплики'
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
            disabled={target.result === null}
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
            disabled={target.result === null || keep_connections}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
