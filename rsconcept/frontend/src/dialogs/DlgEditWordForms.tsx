import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import ConceptTooltip from '../components/common/ConceptTooltip';
import MiniButton from '../components/common/MiniButton';
import Modal from '../components/common/Modal';
import SelectMulti from '../components/common/SelectMulti';
import TextArea from '../components/common/TextArea';
import DataTable, { createColumnHelper } from '../components/DataTable';
import HelpTerminologyControl from '../components/Help/HelpTerminologyControl';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ChevronDoubleDownIcon, CrossIcon, HelpIcon } from '../components/Icons';
import { useConceptTheme } from '../context/ThemeContext';
import useConceptText from '../hooks/useConceptText';
import { Grammeme, ITextRequest, IWordForm, IWordFormPlain } from '../models/language';
import { getCompatibleGrams, parseGrammemes,wordFormEquals } from '../models/languageAPI';
import { IConstituenta, TermForm } from '../models/rsform';
import { colorfgGrammeme } from '../utils/color';
import { labelGrammeme } from '../utils/labels';
import { compareGrammemeOptions,IGrammemeOption, SelectorGrammemesList, SelectorGrammems } from '../utils/selectors';

interface DlgEditWordFormsProps {
  hideWindow: () => void
  target: IConstituenta
  onSave: (data: TermForm[]) => void
}

const columnHelper = createColumnHelper<IWordForm>();

function DlgEditWordForms({ hideWindow, target, onSave }: DlgEditWordFormsProps) {
  const textProcessor = useConceptText();
  const { colors } = useConceptTheme();
  const [term, setTerm] = useState('');

  const [inputText, setInputText] = useState('');
  const [inputGrams, setInputGrams] = useState<IGrammemeOption[]>([]);
  const [options, setOptions] = useState<IGrammemeOption[]>([]);

  const [forms, setForms] = useState<IWordForm[]>([]);
  
  function getData(): TermForm[] {
    const result: TermForm[] = [];
    forms.forEach(
    ({text, grams}) => result.push({
      text: text,
      tags: grams.join(',')
    }));
    return result;
  }

  // Initialization
  useLayoutEffect(
  () => {
    const initForms: IWordForm[] = [];
    target.term_forms.forEach(
    term => initForms.push({
      text: term.text,
      grams: parseGrammemes(term.tags),
    }));
    setForms(initForms);
    setTerm(target.term_resolved);
    setInputText(target.term_resolved);
    setInputGrams([]);
  }, [target]);

  // Filter grammemes when input changes
  useEffect(
  () => {
    const compatible = getCompatibleGrams(
      inputGrams
        .filter(data => Object.values(Grammeme).includes(data.value as Grammeme))
        .map(data => data.value as Grammeme)
    );
    setOptions(SelectorGrammems.filter(({value}) => compatible.includes(value as Grammeme)));
  }, [inputGrams]);

  const handleSubmit = () => onSave(getData());

  function handleAddForm() {
    const newForm: IWordForm = {
      text: inputText,
      grams: inputGrams.map(item => item.value)
    };
    setForms(forms => [
      newForm,
      ...forms.filter(value => !wordFormEquals(value, newForm))
    ]);
  }

  function handleDeleteRow(row: number) {
    setForms(
    (prev) => {
      const newForms: IWordForm[] = [];
      prev.forEach(
      (form, index) => {
        if (index !== row) {
          newForms.push(form);
        }
      });
      return newForms;
    });
  }

  function handleRowClicked(form: IWordForm) {
    setInputText(form.text);
    setInputGrams(SelectorGrammems.filter(gram => form.grams.find(test => test === gram.value)));
  }

  function handleResetAll() {
    setForms([]);
  }

  function handleInflect() {
    const data: IWordFormPlain = {
      text: term,
      grams: inputGrams.map(gram => gram.value).join(',')
    }
    textProcessor.inflect(data, response => setInputText(response.result));
  }

  function handleParse() {
    const data: ITextRequest = {
      text: inputText
    }
    textProcessor.parse(data, response => {
      const grams = parseGrammemes(response.result);
      setInputGrams(SelectorGrammems.filter(gram => grams.find(test => test === gram.value)));
    });
  }

  function handleGenerateLexeme() {
    if (forms.length > 0) {
      if (!window.confirm('Данное действие приведет к перезаписи словоформ при совпадении граммем. Продолжить?')) {
        return;
      }
    }
    const data: ITextRequest = {
      text: inputText
    }
    textProcessor.generateLexeme(data, response => {
      const lexeme: IWordForm[] = [];
      response.items.forEach(
      form => {
        const newForm: IWordForm = {
          text: form.text,
          grams: parseGrammemes(form.grams).filter(gram => SelectorGrammemesList.find(item => item === gram as Grammeme))
        }
        if (newForm.grams.length === 2 && !lexeme.some(test => wordFormEquals(test, newForm))) {
          lexeme.push(newForm);
        }
      });
      setForms(lexeme);
    });
  }

  const columns = useMemo(
  () => [
    columnHelper.accessor('text', {
      id: 'text',
      header: 'Текст',
      size: 350,
      minSize: 350,
      maxSize: 350,
      cell: props => <div className='min-w-[20rem]'>{props.getValue()}</div>
    }),
    columnHelper.accessor('grams', {
      id: 'grams',
      header: 'Граммемы',
      size: 250,
      minSize: 250,
      maxSize: 250,
      cell: props => 
        <div className='flex flex-wrap justify-start gap-1 select-none'>
          {props.getValue().map(
          (gram) => 
            <div
              key={`${props.cell.id}-${gram}`}
              className='min-w-[3rem] px-1 text-sm text-center rounded-md whitespace-nowrap'
              style={{
                borderWidth: '1px', 
                borderColor: colorfgGrammeme(gram, colors),
                color: colorfgGrammeme(gram, colors), 
                fontWeight: 600,
                backgroundColor: colors.bgInput
              }}
            >
              {labelGrammeme(gram)}
            </div>
          )}
        </div>
    }),
    columnHelper.display({
      id: 'actions',
      size: 50,
      minSize: 50,
      maxSize: 50,
      cell: props => 
        <div>
        <MiniButton noHover
          tooltip='Удалить словоформу'
          icon={<CrossIcon size={4} color='text-warning'/>}
          onClick={() => handleDeleteRow(props.row.index)}
        />
        </div>
    })
  ], [colors]);

  return (
  <Modal
    title='Редактирование словоформ'
    hideWindow={hideWindow}
    submitText='Сохранить данные'
    canSubmit
    onSubmit={handleSubmit}
  >
    <div className='relative w-full'>
    <div className='absolute top-0 right-0'>
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
    </div>
      
  <div className='min-w-[40rem] max-w-[40rem]'>
    <TextArea id='nominal' label='Начальная форма'
      placeholder='Начальная форма'
      rows={1}
      
      value={term}
      disabled={true}
      spellCheck
    />

    <div className='mt-4 mb-2 text-sm font-semibold'>
      Параметры словоформы
    </div>

    <div className='flex items-start justify-between w-full'>
      <TextArea
        placeholder='Введите текст'
        rows={2}
        dimensions='min-w-[18rem] w-full min-h-[4.2rem]'
        value={inputText}
        onChange={event => setInputText(event.target.value)}
      />
      <div className='max-w-min'>
        <MiniButton
          tooltip='Генерировать словоформу'
          icon={<ArrowLeftIcon
            size={6}
            color={inputGrams.length == 0 ? 'text-disabled' : 'text-primary'}
          />}
          disabled={textProcessor.loading || inputGrams.length == 0}
          onClick={handleInflect}
        />
        <MiniButton
          tooltip='Определить граммемы'
          icon={<ArrowRightIcon
            size={6}
            color={!inputText ? 'text-disabled' : 'text-primary'}
          />}
          disabled={textProcessor.loading || !inputText}
          onClick={handleParse}
        />
      </div>
      <SelectMulti
        className='z-modal-top min-w-[20rem] max-w-[20rem] h-full flex-grow'
        options={options}
        placeholder='Выберите граммемы'
        
        value={inputGrams}
        onChange={newValue => setInputGrams([...newValue].sort(compareGrammemeOptions))}
      />
    </div>

    <div className='flex justify-between flex-start'>
      <div className='flex items-center justify-start'>
        <MiniButton
          tooltip='Внести словоформу'
          icon={<CheckIcon
            size={6}
            color={!inputText || inputGrams.length == 0 ? 'text-disabled' : 'text-success'}
          />}
          disabled={textProcessor.loading || !inputText || inputGrams.length == 0}
          onClick={handleAddForm}
        />
        <MiniButton
          tooltip='Генерировать все словоформы'
          icon={<ChevronDoubleDownIcon
            size={6}
            color={!inputText ? 'text-disabled' : 'text-primary'}
          />}
          disabled={textProcessor.loading || !inputText}
          onClick={handleGenerateLexeme}
        />
      </div>
      <div className='w-full mt-2 mb-1 text-sm font-semibold text-center'>
        Заданные вручную словоформы: [{forms.length}]
      </div>
      <MiniButton
        tooltip='Сбросить ВСЕ словоформы'
        icon={<CrossIcon
          size={6}
          color={forms.length === 0 ? 'text-disabled' : 'text-warning'}
        />}
        disabled={textProcessor.loading || forms.length === 0}
        onClick={handleResetAll}
        />
    </div>
    
    <div className='border overflow-y-auto max-h-[17.4rem] min-h-[17.4rem] mb-2'>
    <DataTable dense noFooter
        data={forms}
        columns={columns}
        headPosition='0'
        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[2rem]'>
            <p>Список пуст</p>
            <p>Добавьте словоформу</p>
          </span>
        }
        onRowClicked={handleRowClicked}
      />
    </div>
  </div>
  </Modal>);
}

export default DlgEditWordForms;
