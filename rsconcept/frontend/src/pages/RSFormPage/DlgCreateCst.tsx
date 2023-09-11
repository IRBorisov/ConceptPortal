import { useEffect, useState } from 'react';

import ConceptSelectSingle from '../../components/Common/ConceptSelectSingle';
import Modal, { ModalProps } from '../../components/Common/Modal';
import TextArea from '../../components/Common/TextArea';
import RSInput from '../../components/RSInput';
import { CstType,ICstCreateData } from '../../utils/models';
import { CstTypeSelector, getCstTypeLabel } from '../../utils/staticUI';

interface DlgCreateCstProps
extends Pick<ModalProps, 'hideWindow'> {
  initial?: ICstCreateData
  onCreate: (data: ICstCreateData) => void
}

function DlgCreateCst({ hideWindow, initial, onCreate }: DlgCreateCstProps) {
  const [validated, setValidated] = useState(false);
  const [selectedType, setSelectedType] = useState<CstType>(CstType.BASE);
  
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');

  function getData(): ICstCreateData {
    return {
      cst_type: selectedType,
      insert_after: initial?.insert_after ?? null,
      alias: '',
      convention: convention,
      definition_formal: expression,
      definition_raw: textDefinition,
      term_raw: term
    };
  }

  const handleSubmit = () => onCreate(getData());

  useEffect(() => {
    if (initial) {
      setSelectedType(initial.cst_type);
      setTerm(initial.term_raw);
      setTextDefinition(initial.definition_raw);
      setExpression(initial.definition_formal);
      setConvention(initial.convention);
    }
  }, [initial]);

  useEffect(() => setValidated(selectedType !== undefined), [selectedType]);

  return (
    <Modal
      title='Создание конституенты'
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
    >
    <div className='h-fit w-[35rem] px-2 mb-2 flex flex-col justify-stretch'>
      <div className='flex justify-center w-full'>
        <ConceptSelectSingle
          className='my-2 min-w-[15rem] self-center'
          options={CstTypeSelector}
          placeholder='Выберите тип'
          value={selectedType ? { value: selectedType, label: getCstTypeLabel(selectedType) } : null}
          onChange={data => setSelectedType(data?.value ?? CstType.BASE)}
        />
      </div>
      <TextArea id='term' label='Термин'
        placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
        rows={2}
        value={term}
        spellCheck
        onChange={event => setTerm(event.target.value)}
      />
      <div className='mt-3'>
        <RSInput id='expression' label='Формальное выражение'
          editable
          height='5.5rem'
          value={expression}
          onChange={value => setExpression(value)}
        />
      </div>
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
