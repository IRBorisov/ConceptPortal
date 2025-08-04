'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IDeleteReferenceDTO, type IOssLayout, schemaDeleteReference } from '../backend/types';
import { useDeleteReference } from '../backend/use-delete-reference';
import { type IOperationReference, type IOperationSchema } from '../models/oss';

export interface DlgDeleteReferenceProps {
  oss: IOperationSchema;
  target: IOperationReference;
  layout: IOssLayout;
}

export function DlgDeleteReference() {
  const { oss, target, layout } = useDialogsStore(state => state.props as DlgDeleteReferenceProps);
  const { deleteReference } = useDeleteReference();

  const { handleSubmit, control } = useForm<IDeleteReferenceDTO>({
    resolver: zodResolver(schemaDeleteReference),
    defaultValues: {
      target: target.id,
      layout: layout,
      keep_constituents: false,
      keep_connections: false
    }
  });
  const keep_connections = useWatch({ control, name: 'keep_connections' });

  function onSubmit(data: IDeleteReferenceDTO) {
    return deleteReference({ itemID: oss.id, data: data });
  }

  return (
    <ModalForm
      overflowVisible
      header='Удаление операции'
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
            titleHtml='Связи аргументов будут перенаправлены на оригинал ссылки'
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
