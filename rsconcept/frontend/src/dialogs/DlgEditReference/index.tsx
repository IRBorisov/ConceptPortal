import { createColumnHelper } from '@tanstack/react-table';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import ConceptSearch from '../../components/Common/ConceptSearch';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Label from '../../components/Common/Label';
import Modal from '../../components/Common/Modal';
import SelectMulti from '../../components/Common/SelectMulti';
import TextInput from '../../components/Common/TextInput';
import DataTable, { IConditionalStyle } from '../../components/DataTable';
import ConstituentaTooltip from '../../components/Help/ConstituentaTooltip';
import HelpTerminologyControl from '../../components/Help/HelpTerminologyControl';
import { HelpIcon } from '../../components/Icons';
import { useConceptTheme } from '../../context/ThemeContext';
import {
  getCompatibleGrams, Grammeme,
  parseEntityReference, parseGrammemes, 
  parseSyntacticReference, ReferenceType
} from '../../models/language';
import { CstMatchMode } from '../../models/miscelanious';
import { IConstituenta, matchConstituenta } from '../../models/rsform';
import { colorfgCstStatus } from '../../utils/color';
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

const constituentaHelper = createColumnHelper<IConstituenta>();

function DlgEditReference({ hideWindow, items, initial, onSave }: DlgEditReferenceProps) {
  const { colors } = useConceptTheme();

  const [type, setType] = useState<ReferenceType>(ReferenceType.ENTITY);

  const [nominal, setNominal] = useState('');
  const [offset, setOffset] = useState(1);

  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState<IConstituenta[]>([]);
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
      setFilter(initial.text);
    }
  }, [initial, items]);

  // Filter constituents
  useEffect(
  () => {
    if (filter === '') {
      setFilteredData(items.filter(
        (cst) => cst.term_resolved !== '')
      );
    } else {
      setFilteredData(items.filter(
        (cst) => matchConstituenta(filter, cst, CstMatchMode.TERM))
      );
    }
  }, [filter, items]);

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
        <WordformButton id={`${prefixes.wordform_list}${index}`}
          text={data.text} example={data.example} grams={data.grams}
          isSelected={data.grams.every(gram => selectedGrams.find(item => item.value as Grammeme === gram))}
          onSelectGrams={handleSelectGrams}
        />
      )}
      </div>

      <div className='flex flex-start'>
      {PremadeWordForms.slice(6, 12).map(
      (data, index) => 
        <WordformButton id={`${prefixes.wordform_list}${index}`}
          text={data.text} example={data.example} grams={data.grams}
          isSelected={data.grams.every(gram => selectedGrams.find(item => item.value as Grammeme === gram))}
          onSelectGrams={handleSelectGrams}
        />
      )}
      </div>
      
    </div>);
  }, [handleSelectGrams, selectedGrams]);

  const columnsConstituenta = useMemo(
  () => [
    constituentaHelper.accessor('alias', {
      id: 'alias',
      size: 65,
      minSize: 65,
      cell: props => {
        const cst = props.row.original;
        return (<>
          <div
            id={`${prefixes.cst_wordform_list}${cst.alias}`}
            className='min-w-[3.1rem] max-w-[3.1rem] px-1 text-center rounded-md whitespace-nowrap'
            style={{
              borderWidth: '1px', 
              borderColor: colorfgCstStatus(cst.status, colors), 
              color: colorfgCstStatus(cst.status, colors), 
              fontWeight: 600
            }}
          >
            {cst.alias}
          </div>
          <ConstituentaTooltip data={cst} anchor={`#${prefixes.cst_wordform_list}${cst.alias}`} />
        </>);
      }
    }),
    constituentaHelper.accessor('term_resolved', {
      id: 'term',
      size: 600,
      minSize: 350,
      maxSize: 600
    })
  ], [colors]);

  const conditionalRowStyles = useMemo(
  (): IConditionalStyle<IConstituenta>[] => [
    {
      when: (cst: IConstituenta) => cst.alias === alias,
      style: {
        backgroundColor: colors.bgSelected
      },
    }
  ], [alias, colors]);
  
  return (
  <Modal
    title='Редактирование ссылки'
    hideWindow={hideWindow}
    submitText='Сохранить ссылку'
    canSubmit={isValid}
    onSubmit={handleSubmit}
  >
  <div className='min-w-[40rem] max-w-[40rem] flex flex-col gap-4 mb-4 min-h-[34rem]'>
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
    {type === ReferenceType.SYNTACTIC &&
    <div className='flex flex-col gap-2'>
      <div className='flex flex-start'>
        <TextInput id='offset' type='number'
          label='Смещение'
          dimensions='max-w-[10rem]'
          dense
          value={offset}
          onChange={event => setOffset(event.target.valueAsNumber)}
        />
        <div className='self-center ml-2 text-sm font-semibold whitespace-nowrap'>
          Основная ссылка:
        </div>
        <TextInput
          dense
          disabled
          noBorder
          value={mainLink}
          dimensions='w-full text-sm'
        />
      </div>
      <TextInput id='nominal' type='text'
        dimensions='w-full'
        label='Начальная форма'
        placeholder='зависимое слово в начальной форме'
        spellCheck
        value={nominal}
        onChange={event => setNominal(event.target.value)}
      />
    </div>}
    {type === ReferenceType.ENTITY &&
    <div className='flex flex-col gap-2'>
      <div>
        <ConceptSearch 
          value={filter}
          onChange={newValue => setFilter(newValue)}
          dense
        />
        <div className='border min-h-[15.5rem] max-h-[15.5rem] text-sm overflow-y-auto'>
        <DataTable
          data={filteredData}
          columns={columnsConstituenta}
          conditionalRowStyles={conditionalRowStyles}
          
          noHeader
          dense

          noDataComponent={
            <span className='flex flex-col justify-center p-2 text-center min-h-[5rem]'>
              <p>Список конституент пуст</p>
              <p>Измените параметры фильтра</p>
            </span>
          }

          onRowClicked={handleSelectConstituenta}
        />
      </div>
      </div>
      <div className='flex gap-4 flex-start'>
        <TextInput
          label='Отсылаемая конституента'
          dimensions='max-w-[16rem] min-w-[16rem] whitespace-nowrap'
          placeholder='Имя'
          dense
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        <div className='flex items-center w-full flex-start'>
          <div className='self-center text-sm font-semibold'>
            Термин:
          </div>
          <TextInput
            dense
            disabled
            noBorder
            value={term}
            tooltip={term}
            dimensions='w-full text-sm'
          />
        </div>
      </div>
      {FormButtons}
      <div className='flex items-center gap-10 flex-start'>
        <Label text='Отсылаемая словоформа'/>
        <SelectMulti
          className='flex-grow h-full z-modal-top'
          options={gramOptions}
          placeholder='Выберите граммемы'
          
          value={selectedGrams}
          onChange={newValue => setSelectedGrams([...newValue].sort(compareGrammemeOptions))}
        />
      </div>
    </div>}
  </div>
  </Modal>);
}

export default DlgEditReference;
