'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';

import PickSubstitutions from '@/components/select/PickSubstitutions';
import Modal, { ModalProps } from '@/components/ui/Modal';
import { ICstSubstitute, ICstSubstituteData } from '@/models/oss';
import { IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface DlgSubstituteCstProps extends Pick<ModalProps, 'hideWindow'> {
  schema: IRSForm;
  onSubstitute: (data: ICstSubstituteData) => void;
}

function DlgSubstituteCst({ hideWindow, onSubstitute, schema }: DlgSubstituteCstProps) {
  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>([]);

  const canSubmit = useMemo(() => substitutions.length > 0, [substitutions]);

  function handleSubmit() {
    const data: ICstSubstituteData = {
      substitutions: substitutions
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
        allowSelfSubstitution
        substitutions={substitutions}
        setSubstitutions={setSubstitutions}
        rows={6}
        prefixID={prefixes.dlg_cst_substitutes_list}
        schemas={[schema]}
      />
    </Modal>
  );
}

export default DlgSubstituteCst;
