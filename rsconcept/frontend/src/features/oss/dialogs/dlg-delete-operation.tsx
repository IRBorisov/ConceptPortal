'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Checkbox, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IDeleteOperationDTO, type IOssLayout, OperationType, schemaDeleteOperation } from '../backend/types';
import { useDeleteOperation } from '../backend/use-delete-operation';
import { useOssSuspense } from '../backend/use-oss';

export interface DlgDeleteOperationProps {
  ossID: number;
  targetID: number;
  layout: IOssLayout;
  beforeDelete?: () => void;
}

export function DlgDeleteOperation() {
  const { ossID, targetID, layout, beforeDelete } = useDialogsStore(state => state.props as DlgDeleteOperationProps);
  const { deleteOperation } = useDeleteOperation();

  const { schema } = useOssSuspense({ itemID: ossID });
  const target = schema.operationByID.get(targetID)!;

  const { handleSubmit, control } = useForm<IDeleteOperationDTO>({
    resolver: zodResolver(schemaDeleteOperation),
    defaultValues: {
      target: targetID,
      layout: layout,
      keep_constituents: false,
      delete_schema: target.operation_type !== OperationType.INPUT || !target.is_import
    }
  });

  const deleteSchema = useWatch({ control, name: 'delete_schema' });

  function onSubmit(data: IDeleteOperationDTO) {
    return deleteOperation({ itemID: ossID, data: data, beforeUpdate: beforeDelete });
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
            value={field.value ?? false}
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
            value={field.value ?? false}
            onChange={field.onChange}
            disabled={target.result === null}
          />
        )}
      />
      {deleteSchema ? (
        <div className='text-destructive'>
          <b>Внимание!</b> Будет также удалена связанная схема
        </div>
      ) : null}
    </ModalForm>
  );
}
