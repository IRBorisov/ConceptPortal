'use client';

import { useState } from 'react';

import { ICstCreateDTO } from '@/backend/rsform/api';
import Modal from '@/components/ui/Modal';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { CstType, IRSForm } from '@/models/rsform';
import { generateAlias } from '@/models/rsformAPI';
import { useDialogsStore } from '@/stores/dialogs';

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
    <Modal
      header='Создание конституенты'
      canSubmit={validated}
      onSubmit={handleSubmit}
      submitText='Создать'
      className='cc-column w-[35rem] max-h-[30rem] py-2 px-6'
    >
      <FormCreateCst schema={schema} state={cstData} partialUpdate={updateCstData} setValidated={setValidated} />
    </Modal>
  );
}

export default DlgCreateCst;
