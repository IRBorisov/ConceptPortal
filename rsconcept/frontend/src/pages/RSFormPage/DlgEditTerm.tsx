import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import Divider from '../../components/Common/Divider';
import MiniButton from '../../components/Common/MiniButton';
import Modal from '../../components/Common/Modal';
import SelectMulti from '../../components/Common/SelectMulti';
import TextArea from '../../components/Common/TextArea';
import DataTable, { createColumnHelper } from '../../components/DataTable';
import { CheckIcon, ChevronDoubleUpIcon, ChevronUpIcon, CrossIcon } from '../../components/Icons';
import { useConceptTheme } from '../../context/ThemeContext';
import {
  Grammeme, GrammemeGroups, IWordForm,
  matchWordForm, NounGrams, parseGrammemes,
  sortGrammemes, VerbGrams
} from '../../models/language';
import { IConstituenta, TermForm } from '../../models/rsform';
import { colorfgGrammeme } from '../../utils/color';
import { labelGrammeme } from '../../utils/labels';
import { IGrammemeOption, SelectorGrammems } from '../../utils/selectors';

interface DlgEditTermProps {
  hideWindow: () => void
  target: IConstituenta
  onSave: (data: TermForm[]) => void
}

const columnHelper = createColumnHelper<IWordForm>();

function DlgEditTerm({ hideWindow, target, onSave }: DlgEditTermProps) {
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
  }, [target]);

  // Filter grammemes when input changes
  useEffect(
  () => {
    let newFilter: Grammeme[] = [];
    inputGrams.forEach(({type: gram}) => {
      if (!newFilter.includes(gram)) {
        if (NounGrams.includes(gram)) {
          newFilter.push(...NounGrams);
        }
        if (VerbGrams.includes(gram)) {
          newFilter.push(...VerbGrams);
        }
      }
    });

    inputGrams.forEach(({type: gram}) =>
    GrammemeGroups.forEach(group => {
      if (group.includes(gram)) {
        newFilter = newFilter.filter(item => !group.includes(item) || item === gram);
      }
    }));

    newFilter.push(...inputGrams.map(({type: gram}) => gram));
    if (newFilter.length === 0) {
      newFilter = [...VerbGrams, ...NounGrams];
    }
    
    newFilter = [... new Set(newFilter)];
    setOptions(SelectorGrammems.filter(({type: gram}) => newFilter.includes(gram)));
  }, [inputGrams]);

  const handleSubmit = () => onSave(getData());

  function handleAddForm() {
    const newForm: IWordForm = {
      text: inputText,
      grams: inputGrams.map(item => ({
        type: item.type,
        data: item.data
      }))
    };
    setForms(forms => [
      ...forms.filter(value => !matchWordForm(value, newForm)),
      newForm
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

  function handleResetForm() {
    setInputText('');
    setInputGrams([]);
  }

  function handleGenerateSelected() {
    
  }

  function handleGenerateBasics() {
    if (forms.length > 0) {
      if (!window.confirm('Данное действие приведет к перезаписи словоформ при совпадении граммем. Продолжить?')) {
        return;
      }
    }
    
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
        <div className='flex justify-start gap-1 select-none'>
          { props.getValue().map(
          gram => 
            <div
              className='min-w-[3rem] px-1 text-sm text-center rounded-md whitespace-nowrap'
              title=''
              style={{
                borderWidth: '1px', 
                borderColor: colorfgGrammeme(gram.type, colors),
                color: colorfgGrammeme(gram.type, colors), 
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
          dimensions='min-w-[20rem]'
          
          value={inputText}
          onChange={event => setInputText(event.target.value)}
        />
        <div className='flex items-center justify-start'>
          <MiniButton
            tooltip='Добавить словоформу'
            icon={<CheckIcon size={6} color={!inputText || inputGrams.length == 0 ? 'text-disabled' : 'text-success'}/>}
            disabled={!inputText || inputGrams.length == 0}
            onClick={handleAddForm}
          />
          <MiniButton
            tooltip='Сбросить словоформу'
            icon={<CrossIcon size={6} color='text-warning'/>}
            onClick={handleResetForm}
          />
          <MiniButton
            tooltip='Генерировать словоформу'
            icon={<ChevronUpIcon size={6} color={inputGrams.length == 0 ? 'text-disabled' : 'text-primary'}/>}
            disabled={inputGrams.length == 0}
            onClick={handleGenerateSelected}
          />
          <MiniButton
            tooltip='Генерировать базовые словоформы'
            icon={<ChevronDoubleUpIcon size={6} color='text-primary'/>}
            onClick={handleGenerateBasics}
          />
        </div>
      </div>
      <SelectMulti
        className='z-modal-top min-w-[20rem] max-w-[20rem] h-full flex-grow'
        options={options}
        placeholder='Выберите граммемы'
        
        value={inputGrams}
        onChange={newValue => setInputGrams(sortGrammemes([...newValue]))}
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

        // onRowDoubleClicked={handleDoubleClick}
        // onRowClicked={handleRowClicked}
      />
    </div>
  </div>
  </Modal>);
}

export default DlgEditTerm;
