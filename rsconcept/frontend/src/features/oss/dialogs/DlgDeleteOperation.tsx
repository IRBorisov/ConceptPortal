'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';

import { Checkbox, TextInput } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { IOperation, IOperationSchema } from '@/features/oss/models/oss';
import { useDialogsStore } from '@/stores/dialogs';

import { IOperationDeleteDTO, IOperationPosition, schemaOperationDelete } from '../backend/api';
import { useOperationDelete } from '../backend/useOperationDelete';

export interface DlgDeleteOperationProps {
  oss: IOperationSchema;
  target: IOperation;
  positions: IOperationPosition[];
}

function DlgDeleteOperation() {
  const { oss, target, positions } = useDialogsStore(state => state.props as DlgDeleteOperationProps);
  const { operationDelete } = useOperationDelete();

  const { handleSubmit, control } = useForm<IOperationDeleteDTO>({
    resolver: zodResolver(schemaOperationDelete),
    defaultValues: {
      target: target.id,
      positions: positions,
      keep_constituents: false,
      delete_schema: false
    }
  });

  function onSubmit(data: IOperationDeleteDTO) {
    operationDelete({ itemID: oss.id, data: data });
  }

  return (
    <ModalForm
      overflowVisible
      header='Удаление операции'
      submitText='Подтвердить удаление'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className={clsx('w-[35rem]', 'pb-3 px-6 cc-column', 'select-none')}
      helpTopic={HelpTopic.CC_PROPAGATION}
    >
      <TextInput disabled dense noBorder id='operation_alias' label='Операция' value={target.alias} />
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

      <Controller
        control={control}
        name='delete_schema'
        render={({ field }) => (
          <Checkbox
            label='Удалить схему'
            titleHtml={
              !target.is_owned || target.result === undefined
                ? 'Привязанную схему нельзя удалить'
                : 'Удалить схему вместе с операцией'
            }
            value={field.value}
            onChange={field.onChange}
            disabled={!target.is_owned || target.result === null}
          />
        )}
      />
    </ModalForm>
  );
}

export default DlgDeleteOperation;
