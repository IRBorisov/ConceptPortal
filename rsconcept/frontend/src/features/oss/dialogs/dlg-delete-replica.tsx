'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type DeleteReplicaDTO, type OssLayout, schemaDeleteReplica } from '../backend/types';
import { useDeleteReplica } from '../backend/use-delete-replica';
import { useOssSuspense } from '../backend/use-oss';

export interface DlgDeleteReplicaProps {
  ossID: number;
  targetID: number;
  layout: OssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteReplica() {
  const { ossID, targetID, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteReplicaProps);
  const { deleteReplica: deleteReference } = useDeleteReplica();

  const { schema } = useOssSuspense({ itemID: ossID });
  const target = schema.operationByID.get(targetID)!;

  const { handleSubmit, control } = useForm<DeleteReplicaDTO>({
    resolver: zodResolver(schemaDeleteReplica),
    defaultValues: {
      target: targetID,
      layout: layout,
      keep_constituents: false,
      keep_connections: false
    }
  });
  const keep_connections = useWatch({ control, name: 'keep_connections' });

  function onSubmit(data: DeleteReplicaDTO) {
    return deleteReference({ itemID: ossID, data: data, beforeUpdate: beforeDelete });
  }

  return (
    <ModalForm
      overflowVisible
      header='Удаление реплики'
      submitText='Подтвердить удаление'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-140 pb-3 px-6 cc-column select-none'
      helpTopic={HelpTopic.CC_PROPAGATION}
    >
      <TextInput disabled dense noBorder id='operation_alias' label='Операция' value={target.alias} />
      <Controller
        control={control}
        name='keep_connections'
        render={({ field }) => (
          <Checkbox
            label='Переадресовать связи на оригинал'
            titleHtml='Связи аргументов будут перенаправлены на оригинал реплики'
            value={field.value ?? false}
            onChange={field.onChange}
            disabled={target.result === null}
          />
        )}
      />
      <Controller
        control={control}
        name='keep_constituents'
        render={({ field }) => (
          <Checkbox
            label='Сохранить наследованные конституенты'
            titleHtml='Наследованные конституенты <br/>превратятся в дописанные'
            value={field.value ?? false}
            onChange={field.onChange}
            disabled={target.result === null || keep_connections}
          />
        )}
      />
    </ModalForm>
  );
}
