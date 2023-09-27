import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import Divider from '../../components/Common/Divider';
import MiniButton from '../../components/Common/MiniButton';
import Modal from '../../components/Common/Modal';
import SelectMulti from '../../components/Common/SelectMulti';
import TextArea from '../../components/Common/TextArea';
import DataTable, { createColumnHelper } from '../../components/DataTable';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ChevronDoubleDownIcon, CrossIcon } from '../../components/Icons';
import { useConceptTheme } from '../../context/ThemeContext';
import useConceptText from '../../hooks/useConceptText';
import {
  GramData, Grammeme, GrammemeGroups, ITextRequest, IWordForm,
  IWordFormPlain, matchWordForm, NounGrams, parseGrammemes, VerbGrams
} from '../../models/language';
import { IConstituenta, TermForm } from '../../models/rsform';
import { colorfgGrammeme } from '../../utils/color';
import { labelGrammeme } from '../../utils/labels';
import { compareGrammemeOptions,IGrammemeOption, SelectorGrammemesList, SelectorGrammems } from '../../utils/selectors';

interface DlgEditTermProps {
  hideWindow: () => void
  target: IConstituenta
  onSave: (data: TermForm[]) => void
}

const columnHelper = createColumnHelper<IWordForm>();

function DlgEditTerm({ hideWindow, target, onSave }: DlgEditTermProps) {
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
    let newFilter: GramData[] = [];
    inputGrams.forEach(({value: gram}) => {
      if (!newFilter.includes(gram)) {
        if (NounGrams.includes(gram as Grammeme)) {
          newFilter.push(...NounGrams);
        }
        if (VerbGrams.includes(gram as Grammeme)) {
          newFilter.push(...VerbGrams);
        }
      }
    });

    inputGrams.forEach(({value: gram}) =>
    GrammemeGroups.forEach(group => {
      if (group.includes(gram as Grammeme)) {
        newFilter = newFilter.filter(item => !group.includes(item as Grammeme) || item === gram);
      }
    }));

    newFilter.push(...inputGrams.map(({value}) => value));
    if (newFilter.length === 0) {
      newFilter = [...VerbGrams, ...NounGrams];
    }
    
    newFilter = [... new Set(newFilter)];
    setOptions(SelectorGrammems.filter(({value}) => newFilter.includes(value)));
  }, [inputGrams]);

  const handleSubmit = () => onSave(getData());

  function handleAddForm() {
    const newForm: IWordForm = {
      text: inputText,
      grams: inputGrams.map(item => item.value)
    };
    setForms(forms => [
      newForm,
      ...forms.filter(value => !matchWordForm(value, newForm))
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

  function handleResetForm() {
    setInputText('');
    setInputGrams([]);
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
      const newForms: IWordForm[] = response.items.map(
      form => ({
        text: form.text,
        grams: parseGrammemes(form.grams).filter(gram => SelectorGrammemesList.find(item => item === gram as Grammeme))
      }));
      setForms(forms => [
        ...newForms,
        ...forms.filter(value => !newForms.find(test => matchWordForm(value, test))),
      ]);
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
          { props.getValue().map(
          gram => 
            <div
              key={`${props.cell.id}-${gram}`}
              className='min-w-[3rem] px-1 text-sm text-center rounded-md whitespace-nowrap'
              title=''
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
          <MiniButton
            tooltip='Удалить словоформу'
            icon={<CrossIcon size={4} color='text-warning'/>}
            noHover
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
  <div className='min-w-[40rem]'>
    <TextArea id='nominal' label='Начальная форма'
      placeholder='Начальная форма'
      rows={1}
      
      value={term}
      disabled={true}
      spellCheck
    />

    <Divider margins='my-4'/>

    <div className='flex items-start gap-2 justify-stretch min-h-[6.3rem]'>
      <div className='flex flex-col gap-1'>
        <TextArea
          placeholder='Введите текст'
          rows={2}
          dimensions='min-w-[20rem] min-h-[4.2rem]'

          disabled={textProcessor.loading}
          value={inputText}
          onChange={event => setInputText(event.target.value)}
        />
        <div className='flex items-center justify-between select-none'>
          <div className='flex items-center justify-start'>
            <MiniButton
              tooltip='Добавить словоформу'
              icon={<CheckIcon size={6} color={!inputText || inputGrams.length == 0 ? 'text-disabled' : 'text-success'}/>}
              disabled={textProcessor.loading || !inputText || inputGrams.length == 0}
              onClick={handleAddForm}
            />
            <MiniButton
              tooltip='Сбросить словоформу'
              icon={<CrossIcon size={6} color='text-warning'/>}
              disabled={textProcessor.loading}
              onClick={handleResetForm}
            />
            <MiniButton
              tooltip='Генерировать все словоформы'
              icon={<ChevronDoubleDownIcon size={6} color='text-primary'/>}
              disabled={textProcessor.loading}
              onClick={handleGenerateLexeme}
            />
          </div>
          <div className='text-sm'>
            Словоформ: {forms.length}
          </div>
          <div className='flex items-center justify-start'>
            <MiniButton
              tooltip='Генерировать словоформу'
              icon={<ArrowLeftIcon size={6} color={inputGrams.length == 0 ? 'text-disabled' : 'text-primary'}/>}
              disabled={textProcessor.loading || inputGrams.length == 0}
              onClick={handleInflect}
            />
            <MiniButton
              tooltip='Определить граммемы'
              icon={<ArrowRightIcon size={6} color={!inputText ? 'text-disabled' : 'text-primary'}/>}
              disabled={textProcessor.loading || !inputText}
              onClick={handleParse}
            />
          </div>
        </div>
      </div>
      <SelectMulti
        className='z-modal-top min-w-[20rem] max-w-[20rem] h-full flex-grow'
        options={options}
        placeholder='Выберите граммемы'
        
        value={inputGrams}
        isDisabled={textProcessor.loading}
        onChange={newValue => setInputGrams([...newValue].sort(compareGrammemeOptions))}
      />
    </div>
    
    <div className='border overflow-y-auto max-h-[17.4rem] min-h-[17.4rem]'>
    <DataTable
        data={forms}
        columns={columns}
        dense

        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[2rem]'>
            <p>Список пуст</p>
            <p>Добавьте словоформу</p>
          </span>
        }
        
        onRowDoubleClicked={handleRowClicked}
      />
    </div>
  </div>
  </Modal>);
}

export default DlgEditTerm;
