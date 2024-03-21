'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { LuReplace } from 'react-icons/lu';

import ConstituentaSelector from '@/components/select/ConstituentaSelector';
import Checkbox from '@/components/ui/Checkbox';
import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import Modal, { ModalProps } from '@/components/ui/Modal';
import { useRSForm } from '@/context/RSFormContext';
import { IConstituenta, ICstSubstituteData } from '@/models/rsform';

interface DlgSubstituteCstProps extends Pick<ModalProps, 'hideWindow'> {
  onSubstitute: (data: ICstSubstituteData) => void;
}

function DlgSubstituteCst({ hideWindow, onSubstitute }: DlgSubstituteCstProps) {
  const { schema } = useRSForm();

  const [original, setOriginal] = useState<IConstituenta | undefined>(undefined);
  const [substitution, setSubstitution] = useState<IConstituenta | undefined>(undefined);
  const [transferTerm, setTransferTerm] = useState(false);

  const canSubmit = useMemo(() => {
    return !!original && !!substitution && substitution.id !== original.id;
  }, [original, substitution]);

  function handleSubmit() {
    const data: ICstSubstituteData = {
      original: original!.id,
      substitution: substitution!.id,
      transfer_term: transferTerm
    };
    onSubstitute(data);
  }

  return (
    <Modal
      header='Отождествление конституенты'
      submitText='Отождествить'
      submitInvalidTooltip={'Выберите две различные конституенты'}
      hideWindow={hideWindow}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      className={clsx('w-[25rem]', 'px-6 py-3 flex flex-col gap-3 justify-center items-center')}
    >
      <FlexColumn>
        <Label text='Удаляемая конституента' />
        <ConstituentaSelector
          className='w-[20rem]'
          items={schema?.items}
          value={original}
          onSelectValue={setOriginal}
        />
      </FlexColumn>

      <LuReplace size='3rem' className='icon-primary' />

      <FlexColumn>
        <Label text='Подставляемая конституента' />
        <ConstituentaSelector
          className='w-[20rem]'
          items={schema?.items}
          value={substitution}
          onSelectValue={setSubstitution}
        />
      </FlexColumn>
      <Checkbox
        className='mt-3'
        label='Сохранить термин удаляемой конституенты'
        value={transferTerm}
        setValue={setTransferTerm}
      />
    </Modal>
  );
}

export default DlgSubstituteCst;
