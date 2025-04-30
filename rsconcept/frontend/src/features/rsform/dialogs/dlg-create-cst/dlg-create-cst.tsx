'use client';

import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import {
  type IConstituentaBasicsDTO,
  type ICreateConstituentaDTO,
  schemaCreateConstituenta
} from '../../backend/types';
import { useCreateConstituenta } from '../../backend/use-create-constituenta';
import { type IRSForm } from '../../models/rsform';
import { validateNewAlias } from '../../models/rsform-api';

import { FormCreateCst } from './form-create-cst';

export interface DlgCreateCstProps {
  initial: ICreateConstituentaDTO;
  schema: IRSForm;
  onCreate: (data: RO<IConstituentaBasicsDTO>) => void;
}

export function DlgCreateCst() {
  const { initial, schema, onCreate } = useDialogsStore(state => state.props as DlgCreateCstProps);
  const { createConstituenta: cstCreate } = useCreateConstituenta();

  const methods = useForm<ICreateConstituentaDTO>({
    resolver: zodResolver(schemaCreateConstituenta),
    defaultValues: { ...initial }
  });
  const alias = useWatch({ control: methods.control, name: 'alias' });
  const cst_type = useWatch({ control: methods.control, name: 'cst_type' });
  const isValid = validateNewAlias(alias, cst_type, schema);

  function onSubmit(data: ICreateConstituentaDTO) {
    return cstCreate({ itemID: schema.id, data }).then(onCreate);
  }

  return (
    <ModalForm
      header='Создание конституенты'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      submitInvalidTooltip={errorMsg.aliasInvalid}
      submitText='Создать'
      className='cc-column w-140 max-h-120 py-2 px-6'
    >
      <FormProvider {...methods}>
        <FormCreateCst schema={schema} />
      </FormProvider>
    </ModalForm>
  );
}
