'use client';

import { useEffect, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import { ReferenceType } from '@/models/language';
import { parseSyntacticReference } from '@/models/languageAPI';

import { IReferenceInputState } from './DlgEditReference';

interface TabSyntacticReferenceProps {
  initial: IReferenceInputState;
  onChangeValid: (newValue: boolean) => void;
  onChangeReference: (newValue: string) => void;
}

function TabSyntacticReference({ initial, onChangeValid, onChangeReference }: TabSyntacticReferenceProps) {
  const [nominal, setNominal] = useState('');
  const [offset, setOffset] = useState(1);

  const mainLink = (() => {
    const position = offset > 0 ? initial.basePosition + (offset - 1) : initial.basePosition + offset;
    if (offset === 0 || position < 0 || position >= initial.mainRefs.length) {
      return 'Некорректное значение смещения';
    } else {
      return initial.mainRefs[position];
    }
  })();

  useEffect(() => {
    if (initial.refRaw && initial.type === ReferenceType.SYNTACTIC) {
      const ref = parseSyntacticReference(initial.refRaw);
      setOffset(ref.offset);
      setNominal(ref.nominal);
    } else {
      setNominal(initial.text ?? '');
    }
  }, [initial]);

  useEffect(() => {
    onChangeValid(nominal !== '' && offset !== 0);
    onChangeReference(`@{${offset}|${nominal}}`);
  }, [nominal, offset, onChangeValid, onChangeReference]);

  return (
    <div className='cc-fade-in flex flex-col gap-2'>
      <TextInput
        id='dlg_reference_offset'
        type='number'
        dense
        label='Смещение'
        className='max-w-[10rem]'
        value={offset}
        onChange={event => setOffset(event.target.valueAsNumber)}
      />
      <TextInput
        id='dlg_main_ref'
        disabled //
        dense
        noBorder
        label='Основная ссылка'
        value={mainLink}
      />
      <TextInput
        id='dlg_reference_nominal'
        spellCheck
        label='Начальная форма'
        placeholder='зависимое слово в начальной форме'
        value={nominal}
        onChange={event => setNominal(event.target.value)}
      />
    </div>
  );
}

export default TabSyntacticReference;
