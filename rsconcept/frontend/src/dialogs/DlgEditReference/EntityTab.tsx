'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

import ConstituentaPicker from '@/components/select/ConstituentaPicker';
import SelectGrammeme from '@/components/select/SelectGrammeme';
import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import TextInput from '@/components/ui/TextInput';
import { ReferenceType } from '@/models/language';
import { parseEntityReference, parseGrammemes } from '@/models/languageAPI';
import { CstMatchMode } from '@/models/miscellaneous';
import { IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { IGrammemeOption, SelectorGrammemes } from '@/utils/selectors';

import { IReferenceInputState } from './DlgEditReference';
import SelectWordForm from './SelectWordForm';

interface EntityTabProps {
  initial: IReferenceInputState;
  items: IConstituenta[];
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  setReference: React.Dispatch<React.SetStateAction<string>>;
}

function EntityTab({ initial, items, setIsValid, setReference }: EntityTabProps) {
  const [selectedCst, setSelectedCst] = useState<IConstituenta | undefined>(undefined);
  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [selectedGrams, setSelectedGrams] = useState<IGrammemeOption[]>([]);

  // Initialization
  useLayoutEffect(() => {
    if (!!initial.refRaw && initial.type === ReferenceType.ENTITY) {
      const ref = parseEntityReference(initial.refRaw);
      setAlias(ref.entity);
      const grams = parseGrammemes(ref.form);
      setSelectedGrams(SelectorGrammemes.filter(data => grams.includes(data.value)));
    }
  }, [initial, items]);

  // Produce result
  useEffect(() => {
    setIsValid(alias !== '' && selectedGrams.length > 0);
    setReference(`@{${alias}|${selectedGrams.map(gram => gram.value).join(',')}}`);
  }, [alias, selectedGrams, setIsValid, setReference]);

  // Update term when alias changes
  useEffect(() => {
    const cst = items.find(item => item.alias === alias);
    setTerm(cst?.term_resolved ?? '');
  }, [alias, term, items]);

  function handleSelectConstituenta(cst: IConstituenta) {
    setAlias(cst.alias);
    setSelectedCst(cst);
  }

  return (
    <FlexColumn>
      <ConstituentaPicker
        id='dlg_reference_entity_picker'
        initialFilter={initial.text}
        value={selectedCst}
        data={items}
        onSelectValue={handleSelectConstituenta}
        prefixID={prefixes.cst_modal_list}
        describeFunc={cst => cst.term_resolved}
        matchFunc={(cst, filter) => matchConstituenta(cst, filter, CstMatchMode.TERM)}
        onBeginFilter={cst => cst.term_resolved !== ''}
        rows={8}
      />

      <div className='flex gap-3'>
        <TextInput
          id='dlg_reference_alias'
          dense
          label='Конституента'
          placeholder='Имя'
          className='w-[11rem]'
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        <TextInput
          id='dlg_reference_term'
          disabled
          dense
          noBorder
          label='Термин'
          className='flex-grow text-sm'
          value={term}
          title={term}
        />
      </div>

      <SelectWordForm selected={selectedGrams} setSelected={setSelectedGrams} />

      <div className='flex items-center gap-4'>
        <Label text='Словоформа' />
        <SelectGrammeme
          id='dlg_reference_grammemes'
          placeholder='Выберите граммемы'
          className='flex-grow'
          menuPlacement='top'
          value={selectedGrams}
          setValue={setSelectedGrams}
        />
      </div>
    </FlexColumn>
  );
}

export default EntityTab;
