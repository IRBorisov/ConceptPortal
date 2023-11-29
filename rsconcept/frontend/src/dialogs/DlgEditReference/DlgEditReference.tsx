import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Label from '../../components/Common/Label';
import Modal from '../../components/Common/Modal';
import SelectMulti from '../../components/Common/SelectMulti';
import TextInput from '../../components/Common/TextInput';
import HelpTerminologyControl from '../../components/Help/HelpTerminologyControl';
import { HelpIcon } from '../../components/Icons';
import ConstituentaPicker from '../../components/Shared/ConstituentaPicker';
import { Grammeme, ReferenceType } from '../../models/language';
import { getCompatibleGrams, parseEntityReference, parseGrammemes, parseSyntacticReference } from '../../models/languageAPI';
import { CstMatchMode } from '../../models/miscelanious';
import { IConstituenta } from '../../models/rsform';
import { matchConstituenta } from '../../models/rsformAPI';
import { prefixes } from '../../utils/constants';
import { compareGrammemeOptions, IGrammemeOption, PremadeWordForms, SelectorGrammems } from '../../utils/selectors';
import ReferenceTypeButton from './ReferenceTypeButton';
import WordformButton from './WordformButton';

export interface IReferenceInputState {
  type: ReferenceType
  refRaw?: string
  text?: string
  mainRefs: string[]
  basePosition: number
}

interface DlgEditReferenceProps {
  hideWindow: () => void
  items: IConstituenta[]
  initial: IReferenceInputState
  onSave: (newRef: string) => void
}

function DlgEditReference({ hideWindow, items, initial, onSave }: DlgEditReferenceProps) {
  const [type, setType] = useState<ReferenceType>(ReferenceType.ENTITY);

  const [nominal, setNominal] = useState('');
  const [offset, setOffset] = useState(1);

  const [selectedCst, setSelectedCst] = useState<IConstituenta | undefined>(undefined);
  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');

  const [selectedGrams, setSelectedGrams] = useState<IGrammemeOption[]>([]);
  const [gramOptions, setGramOptions] = useState<IGrammemeOption[]>([]);

  const mainLink = useMemo(
  () => {
    const position = offset > 0 ? initial.basePosition + (offset - 1) : initial.basePosition + offset;
    if (offset === 0 || position < 0 || position >= initial.mainRefs.length) {
      return 'Некорректное значение смещения';
    } else {
      return initial.mainRefs[position];
    }
  }, [initial, offset]);

  const isValid = useMemo(
  () => {
    if (type === ReferenceType.ENTITY) {
      return alias !== '' && selectedGrams.length > 0;
    } else if (type === ReferenceType.SYNTACTIC) {
      return nominal !== '' && offset !== 0;
    } else {
      return false;
    }
  }, [type, alias, selectedGrams, nominal, offset]);

  function produceReference(): string {
    if (type === ReferenceType.ENTITY) {
      return `@{${alias}|${selectedGrams.map(gram => gram.value).join(',')}}`;
    } else if (type === ReferenceType.SYNTACTIC) {
      return `@{${offset}|${nominal}}`;
    } else {
      return '';
    }
  }

  // Initialization
  useLayoutEffect(
  () => {
    setType(initial.type);
    if (initial.refRaw) {
      if (initial.type === ReferenceType.ENTITY) {
        const ref = parseEntityReference(initial.refRaw);
        setAlias(ref.entity);
        const grams = parseGrammemes(ref.form);
        setSelectedGrams(SelectorGrammems.filter(data => grams.includes(data.value)));
      } else if (initial.type === ReferenceType.SYNTACTIC) {
        const ref = parseSyntacticReference(initial.refRaw);
        setOffset(ref.offset);
        setNominal(ref.nominal);
      }
    } else if (initial.text) {
      setNominal(initial.text ?? '');
    }
  }, [initial, items]);

  // Filter grammemes when input changes
  useEffect(
  () => {
    const compatible = getCompatibleGrams(
      selectedGrams
        .filter(data => Object.values(Grammeme).includes(data.value as Grammeme))
        .map(data => data.value as Grammeme)
    );
    setGramOptions(SelectorGrammems.filter(({value}) => compatible.includes(value as Grammeme)));
  }, [selectedGrams]);

  // Update term when alias changes
  useEffect(
  () => {
    const cst = items.find(item => item.alias === alias)
    setTerm(cst?.term_resolved ?? '')
  }, [alias, term, items]);

  const handleSubmit = () => onSave(produceReference());

  function handleSelectConstituenta(cst: IConstituenta) {
    setAlias(cst.alias);
    setSelectedCst(cst);
  }

  const handleSelectGrams = useCallback(
  (grams: Grammeme[]) => {
    setSelectedGrams(SelectorGrammems.filter(({value}) => grams.includes(value as Grammeme)));
  }, []);

  const FormButtons = useMemo(() => {
    return (
    <div className='flex flex-col items-center w-full text-sm'>
      <div className='flex flex-start'>
      {PremadeWordForms.slice(0, 6).map(
      (data, index) => 
        <WordformButton key={`${prefixes.wordform_list}${index}`}
          text={data.text} example={data.example} grams={data.grams}
          isSelected={data.grams.every(gram => selectedGrams.find(item => item.value as Grammeme === gram))}
          onSelectGrams={handleSelectGrams}
        />
      )}
      </div>

      <div className='flex flex-start'>
      {PremadeWordForms.slice(6, 12).map(
      (data, index) => 
        <WordformButton key={`${prefixes.wordform_list}${index}`}
          text={data.text} example={data.example} grams={data.grams}
          isSelected={data.grams.every(gram => selectedGrams.find(item => item.value as Grammeme === gram))}
          onSelectGrams={handleSelectGrams}
        />
      )}
      </div>
      
    </div>);
  }, [handleSelectGrams, selectedGrams]);
  
  return (
  <Modal
    title='Редактирование ссылки'
    submitText='Сохранить ссылку'
    hideWindow={hideWindow}
    canSubmit={isValid}
    onSubmit={handleSubmit}
  >
  <div className='min-w-[40rem] max-w-[40rem] flex flex-col gap-3 mb-2 min-h-[34rem]'>
    <div className='flex items-center self-center flex-start'>
      <ReferenceTypeButton 
        type={ReferenceType.ENTITY}
        onSelect={setType}
        isSelected={type === ReferenceType.ENTITY}
      />
      <ReferenceTypeButton 
        type={ReferenceType.SYNTACTIC}
        onSelect={setType}
        isSelected={type === ReferenceType.SYNTACTIC}
      />
      <div id='terminology-help' className='px-1 py-1'>
        <HelpIcon color='text-primary' size={5} />
      </div>
      <ConceptTooltip
        anchorSelect='#terminology-help'
        className='max-w-[30rem] z-modal-tooltip'
        offset={4}
      >
        <HelpTerminologyControl />
      </ConceptTooltip>
    </div>
    {type === ReferenceType.SYNTACTIC ?
    <div className='flex flex-col gap-2'>
      <div className='flex flex-start'>
        <TextInput type='number' dense
          label='Смещение'
          dimensions='max-w-[10rem]'
          value={offset}
          onChange={event => setOffset(event.target.valueAsNumber)}
        />
        <div className='self-center ml-2 text-sm font-semibold whitespace-nowrap'>
          Основная ссылка:
        </div>
        <TextInput disabled dense noBorder
          value={mainLink}
          dimensions='w-full text-sm'
        />
      </div>
      <TextInput spellCheck
        label='Начальная форма'
        placeholder='зависимое слово в начальной форме'
        value={nominal}
        onChange={event => setNominal(event.target.value)}
      />
    </div> : null}
    {type === ReferenceType.ENTITY ?
    <div className='flex flex-col gap-3'>
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

      <div className='flex gap-4 flex-start'>
        <TextInput dense
          label='Отсылаемая конституента'
          placeholder='Имя'
          dimensions='max-w-[16rem] min-w-[16rem] whitespace-nowrap'
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        <div className='flex items-center w-full flex-start'>
          <div className='self-center text-sm font-semibold'>
            Термин:
          </div>
          <TextInput disabled dense noBorder
            value={term}
            tooltip={term}
            dimensions='w-full text-sm'
          />
        </div>
      </div>

      {FormButtons}
      
      <div className='flex items-center gap-4 flex-start'>
        <Label text='Отсылаемая словоформа'/>
        <SelectMulti
          placeholder='Выберите граммемы'
          className='flex-grow h-full'
          menuPlacement='top'
          options={gramOptions}
          value={selectedGrams}
          onChange={newValue => setSelectedGrams([...newValue].sort(compareGrammemeOptions))}
        />
      </div>
    </div> : null}
  </div>
  </Modal>);
}

export default DlgEditReference;
