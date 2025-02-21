'use client';

import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';

import { type IConstituentaBasicsDTO, type ICstCreateDTO, schemaCstCreate } from '../../backend/types';
import { useCstCreate } from '../../backend/useCstCreate';
import { type IRSForm } from '../../models/rsform';
import { validateNewAlias } from '../../models/rsformAPI';

import { FormCreateCst } from './FormCreateCst';

export interface DlgCreateCstProps {
  initial: ICstCreateDTO;
  schema: IRSForm;
  onCreate: (data: IConstituentaBasicsDTO) => void;
}

export function DlgCreateCst() {
  const { initial, schema, onCreate } = useDialogsStore(state => state.props as DlgCreateCstProps);
  const { cstCreate } = useCstCreate();

  const methods = useForm<ICstCreateDTO>({
    resolver: zodResolver(schemaCstCreate),
    defaultValues: { ...initial }
  });
  const alias = useWatch({ control: methods.control, name: 'alias' });
  const cst_type = useWatch({ control: methods.control, name: 'cst_type' });
  const isValid = validateNewAlias(alias, cst_type, schema);

  function onSubmit(data: ICstCreateDTO) {
    return cstCreate({ itemID: schema.id, data }).then(onCreate);
  }

  return (
    <ModalForm
      header='Создание конституенты'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      submitInvalidTooltip={errorMsg.aliasInvalid}
      submitText='Создать'
      className='cc-column w-[35rem] max-h-[30rem] py-2 px-6'
    >
      <FormProvider {...methods}>
        <FormCreateCst schema={schema} />
      </FormProvider>
    </ModalForm>
  );
}
