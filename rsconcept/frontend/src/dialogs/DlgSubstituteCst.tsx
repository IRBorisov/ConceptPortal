'use client';

import clsx from 'clsx';
import { useState } from 'react';

import PickSubstitutions from '@/components/select/PickSubstitutions';
import { ModalForm } from '@/components/ui/Modal';
import { HelpTopic } from '@/models/miscellaneous';
import { ICstSubstitute, ICstSubstitutions } from '@/models/oss';
import { IRSForm } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgSubstituteCstProps {
  schema: IRSForm;
  onSubstitute: (data: ICstSubstitutions) => void;
}

function DlgSubstituteCst() {
  const { onSubstitute, schema } = useDialogsStore(state => state.props as DlgSubstituteCstProps);
  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>([]);
  const canSubmit = substitutions.length > 0;

  function handleSubmit() {
    onSubstitute({ substitutions: substitutions });
    return true;
  }

  return (
    <ModalForm
      header='Отождествление'
      submitText='Отождествить'
      submitInvalidTooltip='Выберите две различные конституенты'
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      className={clsx('w-[40rem]', 'px-6 pb-3')}
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
    >
      <PickSubstitutions
        allowSelfSubstitution
        value={substitutions}
        onChange={setSubstitutions}
        rows={6}
        schemas={[schema]}
      />
    </ModalForm>
  );
}

export default DlgSubstituteCst;
