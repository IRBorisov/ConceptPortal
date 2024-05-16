'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';

import PickSubstitutions from '@/components/select/PickSubstitutions';
import Modal, { ModalProps } from '@/components/ui/Modal';
import { useRSForm } from '@/context/RSFormContext';
import { ICstSubstituteData, ISubstitution } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface DlgSubstituteCstProps extends Pick<ModalProps, 'hideWindow'> {
  onSubstitute: (data: ICstSubstituteData) => void;
}

function DlgSubstituteCst({ hideWindow, onSubstitute }: DlgSubstituteCstProps) {
  const { schema } = useRSForm();

  const [substitutions, setSubstitutions] = useState<ISubstitution[]>([]);

  const canSubmit = useMemo(() => substitutions.length > 0, [substitutions]);

  function handleSubmit() {
    const data: ICstSubstituteData = {
      substitutions: substitutions.map(item => ({
        original: item.deleteRight ? item.rightCst.id : item.leftCst.id,
        substitution: item.deleteRight ? item.leftCst.id : item.rightCst.id,
        transfer_term: !item.deleteRight && item.takeLeftTerm
      }))
    };
    onSubstitute(data);
  }

  return (
    <Modal
      header='Отождествление'
      submitText='Отождествить'
      submitInvalidTooltip={'Выберите две различные конституенты'}
      hideWindow={hideWindow}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      className={clsx('w-[40rem]', 'px-6 pb-3')}
    >
      <PickSubstitutions
        items={substitutions}
        setItems={setSubstitutions}
        rows={6}
        prefixID={prefixes.dlg_cst_substitutes_list}
        schema1={schema}
        schema2={schema}
      />
    </Modal>
  );
}

export default DlgSubstituteCst;
