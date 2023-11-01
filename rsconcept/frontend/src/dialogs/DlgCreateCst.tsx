import { useEffect, useLayoutEffect, useState } from 'react';

import Modal, { ModalProps } from '../components/Common/Modal';
import SelectSingle from '../components/Common/SelectSingle';
import TextArea from '../components/Common/TextArea';
import TextInput from '../components/Common/TextInput';
import RSInput from '../components/RSInput';
import { CstType,ICstCreateData, IRSForm } from '../models/rsform';
import { labelCstType } from '../utils/labels';
import { createAliasFor, getCstTypePrefix } from '../utils/misc';
import { SelectorCstType } from '../utils/selectors';

interface DlgCreateCstProps
extends Pick<ModalProps, 'hideWindow'> {
  initial?: ICstCreateData
  schema: IRSForm
  onCreate: (data: ICstCreateData) => void
}

function DlgCreateCst({ hideWindow, initial, schema, onCreate }: DlgCreateCstProps) {
  const [validated, setValidated] = useState(false);
  const [selectedType, setSelectedType] = useState<CstType>(CstType.BASE);
  const [alias, setAlias] = useState('');
  
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');

  function getData(): ICstCreateData {
    return {
      cst_type: selectedType,
      insert_after: initial?.insert_after ?? null,
      alias: alias,
      convention: convention,
      definition_formal: expression,
      definition_raw: textDefinition,
      term_raw: term,
      term_forms: []
    };
  }

  const handleSubmit = () => onCreate(getData());

  useLayoutEffect(() => {
    if (initial) {
      setSelectedType(initial.cst_type);
      setTerm(initial.term_raw);
      setTextDefinition(initial.definition_raw);
      setExpression(initial.definition_formal);
      setConvention(initial.convention);
      setAlias(initial.alias);
    }
  }, [initial]);

  useLayoutEffect(
  () => {
    setAlias(createAliasFor(selectedType, schema));
  }, [selectedType, schema]);

  useEffect(
  () => {
    if(alias.length < 2 || alias[0] !== getCstTypePrefix(selectedType)) {
      setValidated(false);
    } else {
      setValidated(!schema.items.find(cst => cst.alias === alias))
    }
  }, [alias, selectedType, schema]);

  return (
    <Modal
      title='Создание конституенты'
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
      submitText='Создать'
    >
    <div className='h-fit w-[35rem] px-2 mb-2 flex flex-col justify-stretch gap-3'>
      <div className='flex justify-center w-full gap-6'>
        <SelectSingle
          className='my-2 min-w-[15rem] self-center'
          options={SelectorCstType}
          placeholder='Выберите тип'
          value={selectedType ? { value: selectedType, label: labelCstType(selectedType) } : null}
          onChange={data => setSelectedType(data?.value ?? CstType.BASE)}
        />
        <TextInput id='alias' label='Имя'
          dense
          dimensions='w-[7rem]'
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
      </div>
      <TextArea id='term' label='Термин'
        placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
        rows={2}
        value={term}
        spellCheck
        onChange={event => setTerm(event.target.value)}
      />
      <RSInput id='expression' label='Формальное выражение'
        placeholder='Родоструктурное выражение, задающее формальное определение'
        editable
        height='4.8rem'
        value={expression}
        onChange={value => setExpression(value)}
      />
      <TextArea id='definition' label='Текстовое определение'
        placeholder='Лингвистическая интерпретация формального выражения'
        rows={2}
        value={textDefinition}
        spellCheck
        onChange={event => setTextDefinition(event.target.value)}
      />
      <TextArea id='convention' label='Конвенция / Комментарий'
        placeholder='Договоренность об интерпретации неопределяемого понятия&#x000D;&#x000A;Комментарий к производному понятию'
        rows={2}
        value={convention}
        spellCheck
        onChange={event => setConvention(event.target.value)}
      />
    </div>
    </Modal>
  );
}

export default DlgCreateCst;
