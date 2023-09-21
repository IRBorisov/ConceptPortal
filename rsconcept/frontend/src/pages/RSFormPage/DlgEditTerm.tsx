import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import Divider from '../../components/Common/Divider';
import MiniButton from '../../components/Common/MiniButton';
import Modal from '../../components/Common/Modal';
import SelectMulti from '../../components/Common/SelectMulti';
import TextArea from '../../components/Common/TextArea';
import DataTable, { createColumnHelper } from '../../components/DataTable';
import { CheckIcon, ChevronDoubleUpIcon, ChevronUpIcon, CrossIcon } from '../../components/Icons';
import { Grammeme, GrammemeGroups, IWordForm, NounGrams, parseGrammemes,VerbGrams } from '../../models/language';
import { IConstituenta, TermForm } from '../../models/rsform';
import { labelGrammeme } from '../../utils/labels';
import { IGrammemeOption, SelectorGrammems } from '../../utils/selectors';

interface DlgEditTermProps {
  hideWindow: () => void
  target: IConstituenta
  onSave: (data: TermForm[]) => void
}

const columnHelper = createColumnHelper<IWordForm>();

function DlgEditTerm({ hideWindow, target, onSave }: DlgEditTermProps) { 
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
  }, [target]);

  // Filter grammemes when input changes
  useEffect(
  () => {
    let newFilter: Grammeme[] = [];
    inputGrams.forEach(({value: gram}) => {
      if (!newFilter.includes(gram)) {
        if (NounGrams.includes(gram)) {
          newFilter.push(...NounGrams);
        }
        if (VerbGrams.includes(gram)) {
          newFilter.push(...NounGrams);
        }
      }
    });

    inputGrams.forEach(({value: gram}) =>
    GrammemeGroups.forEach(group => {
      if (group.includes(gram)) {
        newFilter = newFilter.filter(item => !group.includes(item) || item === gram);
      }
    }));

    newFilter.push(...inputGrams.map(({value: gram}) => gram));
    if (newFilter.length === 0) {
      newFilter = [...VerbGrams, ...NounGrams];
    }
    
    newFilter = [... new Set(newFilter)];
    setOptions(SelectorGrammems.filter(({value: gram}) => newFilter.includes(gram)));
  }, [inputGrams]);

  const handleSubmit = () => onSave(getData());

  function handleAddForm() {
    setForms(forms => [
      ...forms,
      {
        text: inputText,
        grams: inputGrams.map(item => ({
          type: item.value, data: item.value as string
        }))
      }
    ]);
  }

  function handleResetForm() {
    
  }

  function handleGenerateSelected() {
    
  }

  function handleGenerateBasics() {
    
  }

  const columns = useMemo(
  () => [
    columnHelper.accessor('text', {
      id: 'text',
      header: 'Текст',
      size: 350,
      minSize: 350,
      maxSize: 350
    }),
    columnHelper.accessor('grams', {
      id: 'grams',
      header: 'Граммемы',
      size: 250,
      minSize: 250,
      maxSize: 250,
      cell: props => {
        return (
        <div className='flex justify-start gap-1 select-none'>
          { props.getValue().map(
          data => (<>
            <div
              className='min-w-[3rem] px-1 text-center rounded-md whitespace-nowrap border clr-border clr-input'
              title=''
              // style={{
              //   borderWidth: '1px', 
              //   borderColor: getCstStatusFgColor(cst.status, colors), 
              //   color: getCstStatusFgColor(cst.status, colors), 
              //   fontWeight: 600,
              //   backgroundColor: isMockCst(cst) ? colors.bgWarning : colors.bgInput
              // }}
            >
              {labelGrammeme(data)}
            </div>
            {/* <ConstituentaTooltip data={cst} anchor={`#${prefixes.cst_list}${cst.alias}`} /> */}
          </>))}
        </div>);
      }

      // cell: props => 
      //   <div style={{
      //     fontSize: 12,
      //     color: isMockCst(props.row.original) ? colors.fgWarning : undefined
      //   }}>
      //     {props.getValue()}
      //   </div>
    }),
    // columnHelper.accessor(, {

    // })
  ], []);

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
            icon={<CheckIcon size={6} color='text-success'/>}
            onClick={handleAddForm}
          />
          <MiniButton
            tooltip='Сбросить словоформу'
            icon={<CrossIcon size={6} color='text-warning'/>}
            onClick={handleResetForm}
          />
          <MiniButton
            tooltip='Генерировать словоформу'
            icon={<ChevronUpIcon size={6} color='text-primary'/>}
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
        onChange={data => setInputGrams(data.map(value => value))}
      />
    </div>
    
    <div className='border overflow-y-auto max-h-[20rem]'>
    <DataTable
        data={forms}
        columns={columns}
        dense

        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[2rem]'>
            <p>Список пуст</p>
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
