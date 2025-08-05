'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IDeleteOperationDTO, type IOssLayout, OperationType, schemaDeleteOperation } from '../backend/types';
import { useDeleteOperation } from '../backend/use-delete-operation';
import { type IOperationInput, type IOperationSchema, type IOperationSynthesis } from '../models/oss';

export interface DlgDeleteOperationProps {
  oss: IOperationSchema;
  target: IOperationInput | IOperationSynthesis;
  layout: IOssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteOperation() {
  const { oss, target, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteOperationProps);
  const { deleteOperation } = useDeleteOperation();

  const { handleSubmit, control } = useForm<IDeleteOperationDTO>({
    resolver: zodResolver(schemaDeleteOperation),
    defaultValues: {
      target: target.id,
      layout: layout,
      keep_constituents: false,
      delete_schema: true
    }
  });

  function onSubmit(data: IDeleteOperationDTO) {
    return deleteOperation({ itemID: oss.id, data: data, beforeUpdate: beforeDelete });
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
        name='delete_schema'
        render={({ field }) => (
          <Checkbox
            label='Удалить схему'
            titleHtml={
              (target.operation_type === OperationType.INPUT && target.is_import) || target.result === null
                ? 'Привязанную схему нельзя удалить'
                : 'Удалить схему вместе с операцией'
            }
            value={field.value}
            onChange={field.onChange}
            disabled={(target.operation_type === OperationType.INPUT && target.is_import) || target.result === null}
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
            disabled={target.result === null}
          />
        )}
      />
    </ModalForm>
  );
}
