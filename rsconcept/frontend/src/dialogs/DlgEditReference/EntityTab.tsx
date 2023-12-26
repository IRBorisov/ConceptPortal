'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

import FlexColumn from '@/components/Common/FlexColumn';
import Label from '@/components/Common/Label';
import TextInput from '@/components/Common/TextInput';
import ConstituentaPicker from '@/components/Shared/ConstituentaPicker';
import SelectGrammeme from '@/components/Shared/SelectGrammeme';
import { ReferenceType } from '@/models/language';
import { parseEntityReference, parseGrammemes } from '@/models/languageAPI';
import { CstMatchMode } from '@/models/miscellaneous';
import { IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { IGrammemeOption, SelectorGrammems } from '@/utils/selectors';

import { IReferenceInputState } from './DlgEditReference';
import SelectWordForm from './SelectWordForm';

interface EntityTabProps {
  initial: IReferenceInputState
  items: IConstituenta[]
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>
  setReference: React.Dispatch<React.SetStateAction<string>>
}

function EntityTab({ initial, items, setIsValid, setReference }: EntityTabProps) {
  const [selectedCst, setSelectedCst] = useState<IConstituenta | undefined>(undefined);
  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [selectedGrams, setSelectedGrams] = useState<IGrammemeOption[]>([]);

  // Initialization
  useLayoutEffect(
  () => {
    if (!!initial.refRaw && initial.type === ReferenceType.ENTITY) {
      const ref = parseEntityReference(initial.refRaw);
      setAlias(ref.entity);
      const grams = parseGrammemes(ref.form);
      setSelectedGrams(SelectorGrammems.filter(data => grams.includes(data.value)));
    }
  }, [initial, items]);

  // Produce result
  useEffect(
  () => {
    setIsValid(alias !== '' && selectedGrams.length > 0);
    setReference(`@{${alias}|${selectedGrams.map(gram => gram.value).join(',')}}`);
  }, [alias, selectedGrams, setIsValid, setReference]);

  // Update term when alias changes
  useEffect(
  () => {
    const cst = items.find(item => item.alias === alias)
    setTerm(cst?.term_resolved ?? '')
  }, [alias, term, items]);

  function handleSelectConstituenta(cst: IConstituenta) {
    setAlias(cst.alias);
    setSelectedCst(cst);
  }
  
  return (
  <FlexColumn>
    <ConstituentaPicker 
      value={selectedCst}
      data={items}
      onSelectValue={handleSelectConstituenta}
      prefixID={prefixes.cst_modal_list}
      describeFunc={cst => cst.term_resolved}
      matchFunc={(cst, filter) => matchConstituenta(cst, filter, CstMatchMode.TERM)}
      prefilterFunc={cst => cst.term_resolved !== ''}
      rows={8}
    />

    <div className='flex gap-3'>
      <TextInput dense
        label='Конституента'
        placeholder='Имя'
        className='w-[11rem]'
        value={alias}
        onChange={event => setAlias(event.target.value)}
      />
      <TextInput disabled dense noBorder
        label='Термин'
        className='flex-grow text-sm'
        value={term}
        title={term}
      />
    </div>

    <SelectWordForm
      selected={selectedGrams}
      setSelected={setSelectedGrams}
    />
    
    <div className='flex items-center gap-4'>
      <Label text='Словоформа'/>
      <SelectGrammeme
        placeholder='Выберите граммемы'
        className='flex-grow'
        menuPlacement='top'
        value={selectedGrams}
        setValue={setSelectedGrams}
      />
    </div>
  </FlexColumn>);
}

export default EntityTab;