'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import TextInput from '@/components/Common/TextInput';
import { ReferenceType } from '@/models/language';
import { parseSyntacticReference } from '@/models/languageAPI';

import { IReferenceInputState } from './DlgEditReference';

interface SyntacticTabProps {
  initial: IReferenceInputState
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>
  setReference: React.Dispatch<React.SetStateAction<string>>
}

function SyntacticTab({ initial, setIsValid, setReference }: SyntacticTabProps) {
  const [nominal, setNominal] = useState('');
  const [offset, setOffset] = useState(1);

  const mainLink = useMemo(
  () => {
    const position = offset > 0 ? initial.basePosition + (offset - 1) : initial.basePosition + offset;
    if (offset === 0 || position < 0 || position >= initial.mainRefs.length) {
      return 'Некорректное значение смещения';
    } else {
      return initial.mainRefs[position];
    }
  }, [initial, offset]);

  useLayoutEffect(
  () => {
    if (initial.refRaw && initial.type === ReferenceType.SYNTACTIC) {
      const ref = parseSyntacticReference(initial.refRaw);
      setOffset(ref.offset);
      setNominal(ref.nominal);
    } else {
      setNominal(initial.text ?? '');
    }
  }, [initial]);
  
  useEffect(
  () => {
    setIsValid(nominal !== '' && offset !== 0);
    setReference(`@{${offset}|${nominal}}`);
  }, [nominal, offset, setIsValid, setReference]);

  return (
  <div className='flex flex-col gap-2'>
    <TextInput type='number' dense
      label='Смещение'
      className='max-w-[10rem]'
      value={offset}
      onChange={event => setOffset(event.target.valueAsNumber)}
    />
    <TextInput disabled dense noBorder
        label='Основная ссылка'
        value={mainLink}
      />
    <TextInput spellCheck
      label='Начальная форма'
      placeholder='зависимое слово в начальной форме'
      value={nominal}
      onChange={event => setNominal(event.target.value)}
    />
  </div>);
}

export default SyntacticTab;