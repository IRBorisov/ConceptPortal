'use client';

import { useState } from 'react';

import { ModalForm } from '@/components/Modal';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { useDialogsStore } from '@/stores/dialogs';

import { ICstCreateDTO } from '../../backend/types';
import { CstType, IRSForm } from '../../models/rsform';
import { generateAlias } from '../../models/rsformAPI';

import FormCreateCst from './FormCreateCst';

export interface DlgCreateCstProps {
  initial?: ICstCreateDTO;
  schema: IRSForm;
  onCreate: (data: ICstCreateDTO) => void;
}

function DlgCreateCst() {
  const { initial, schema, onCreate } = useDialogsStore(state => state.props as DlgCreateCstProps);

  const [validated, setValidated] = useState(false);
  const [cstData, updateCstData] = usePartialUpdate(
    initial || {
      cst_type: CstType.BASE,
      insert_after: null,
      alias: generateAlias(CstType.BASE, schema),
      convention: '',
      definition_formal: '',
      definition_raw: '',
      term_raw: '',
      term_forms: []
    }
  );

  const handleSubmit = () => {
    onCreate(cstData);
    return true;
  };

  return (
    <ModalForm
      header='Создание конституенты'
      canSubmit={validated}
      onSubmit={handleSubmit}
      submitText='Создать'
      className='cc-column w-[35rem] max-h-[30rem] py-2 px-6'
    >
      <FormCreateCst schema={schema} state={cstData} partialUpdate={updateCstData} setValidated={setValidated} />
    </ModalForm>
  );
}

export default DlgCreateCst;
