'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

import Modal, { ModalProps } from '@/components/ui/Modal';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { CstType, ICstCreateData, IRSForm } from '@/models/rsform';
import { generateAlias, validateNewAlias } from '@/models/rsformAPI';

import FormCreateCst from './FormCreateCst';

interface DlgCreateCstProps extends Pick<ModalProps, 'hideWindow'> {
  initial?: ICstCreateData;
  schema: IRSForm;
  onCreate: (data: ICstCreateData) => void;
}

function DlgCreateCst({ hideWindow, initial, schema, onCreate }: DlgCreateCstProps) {
  const [validated, setValidated] = useState(false);
  const [cstData, updateCstData] = usePartialUpdate(
    initial || {
      cst_type: CstType.BASE,
      insert_after: null,
      alias: '',
      convention: '',
      definition_formal: '',
      definition_raw: '',
      term_raw: '',
      term_forms: []
    }
  );

  const handleSubmit = () => onCreate(cstData);

  useLayoutEffect(() => {
    updateCstData({ alias: generateAlias(cstData.cst_type, schema) });
  }, [cstData.cst_type, updateCstData, schema]);

  useEffect(() => {
    setValidated(validateNewAlias(cstData.alias, cstData.cst_type, schema));
  }, [cstData.alias, cstData.cst_type, schema]);

  return (
    <Modal
      header='Создание конституенты'
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
      submitText='Создать'
      className='cc-column w-[35rem] h-[30rem] py-2 px-6'
    >
      <FormCreateCst schema={schema} state={cstData} partialUpdate={updateCstData} setValidated={setValidated} />
    </Modal>
  );
}

export default DlgCreateCst;
