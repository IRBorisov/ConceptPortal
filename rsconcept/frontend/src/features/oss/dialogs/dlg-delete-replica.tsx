'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IDeleteReplicaDTO, type IOssLayout, schemaDeleteReplica } from '../backend/types';
import { useDeleteReplica } from '../backend/use-delete-replica';
import { type IOperationReplica, type IOperationSchema } from '../models/oss';

export interface DlgDeleteReplicaProps {
  oss: IOperationSchema;
  target: IOperationReplica;
  layout: IOssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteReplica() {
  const { oss, target, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteReplicaProps);
  const { deleteReplica: deleteReference } = useDeleteReplica();

  const { handleSubmit, control } = useForm<IDeleteReplicaDTO>({
    resolver: zodResolver(schemaDeleteReplica),
    defaultValues: {
      target: target.id,
      layout: layout,
      keep_constituents: false,
      keep_connections: false
    }
  });
  const keep_connections = useWatch({ control, name: 'keep_connections' });

  function onSubmit(data: IDeleteReplicaDTO) {
    return deleteReference({ itemID: oss.id, data: data, beforeUpdate: beforeDelete });
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
            value={field.value}
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
            value={field.value}
            onChange={field.onChange}
            disabled={target.result === null || keep_connections}
          />
        )}
      />
    </ModalForm>
  );
}
