'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

import PickConstituenta from '@/components/select/PickConstituenta';
import SelectMultiGrammeme from '@/components/select/SelectMultiGrammeme';
import Label from '@/components/ui/Label';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { ReferenceType } from '@/models/language';
import { parseEntityReference, parseGrammemes } from '@/models/languageAPI';
import { CstMatchMode } from '@/models/miscellaneous';
import { IConstituenta, IRSForm } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { IGrammemeOption, SelectorGrammemes } from '@/utils/selectors';

import SelectWordForm from '../../components/select/SelectWordForm';
import { IReferenceInputState } from './DlgEditReference';

interface TabEntityReferenceProps {
  initial: IReferenceInputState;
  schema: IRSForm;
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  setReference: React.Dispatch<React.SetStateAction<string>>;
}

function TabEntityReference({ initial, schema, setIsValid, setReference }: TabEntityReferenceProps) {
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
  }, [initial, schema.items]);

  // Produce result
  useEffect(() => {
    setIsValid(alias !== '' && selectedGrams.length > 0);
    setReference(`@{${alias}|${selectedGrams.map(gram => gram.value).join(',')}}`);
  }, [alias, selectedGrams, setIsValid, setReference]);

  // Update term when alias changes
  useEffect(() => {
    const cst = schema.cstByAlias.get(alias);
    setTerm(cst?.term_resolved ?? '');
  }, [alias, term, schema]);

  function handleSelectConstituenta(cst: IConstituenta) {
    setAlias(cst.alias);
    setSelectedCst(cst);
  }

  return (
    <AnimateFade className='cc-column'>
      <PickConstituenta
        id='dlg_reference_entity_picker'
        initialFilter={initial.text}
        value={selectedCst}
        data={schema.items}
        onSelectValue={handleSelectConstituenta}
        prefixID={prefixes.cst_modal_list}
        describeFunc={cst => cst.term_resolved}
        matchFunc={(cst, filter) => matchConstituenta(cst, filter, CstMatchMode.TERM)}
        onBeginFilter={cst => cst.term_resolved !== ''}
        rows={7}
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
        <SelectMultiGrammeme
          id='dlg_reference_grammemes'
          placeholder='Выберите граммемы'
          className='flex-grow'
          menuPlacement='top'
          value={selectedGrams}
          setValue={setSelectedGrams}
        />
      </div>
    </AnimateFade>
  );
}

export default TabEntityReference;
