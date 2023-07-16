import { useCallback, useEffect, useState } from 'react';
import PrettyJson from '../../components/Common/PrettyJSON';
import { useRSForm } from '../../context/RSFormContext';
import { GetCstTypeLabel } from '../../models';
import { toast } from 'react-toastify';
import TextArea from '../../components/Common/TextArea';
import ExpressionEditor from './ExpressionEditor';
import SubmitButton from '../../components/Common/SubmitButton';

function ConstituentEditor() {
  const { active, schema, setActive, isEditable } = useRSForm();

  const [alias, setAlias] = useState('');
  const [type, setType] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');

  useEffect(() => {
    if (!active && schema?.items && schema?.items.length > 0) {
      setActive(schema?.items[0]);
    }
  }, [schema, setActive, active])

  useEffect(() => {
    if (active) {
      setAlias(active.alias);
      setType(GetCstTypeLabel(active.cstType));
      setTerm(active.term?.raw || '');
      setTextDefinition(active.definition?.text?.raw || '');
      setExpression(active.definition?.formal || '');
    }
  }, [active]);
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // if (!processing) {
    //   const data = {
    //     'title': title,
    //     'alias': alias,
    //     'comment': comment,
    //     'is_common': common,
    //   };
    //   upload(data, () => {
    //     toast.success('Изменения сохранены');
    //     reload();
    //   });
    // }
  };

  const handleRename = useCallback(() => {
    toast.info('Переименование в разработке');
  }, []);

  const handleChangeType = useCallback(() => {
    toast.info('Изменение типа в разработке');
  }, []);


  return (
    <div className='flex items-start w-full gap-2'>
      <form onSubmit={handleSubmit} className='flex-grow min-w-[50rem] px-4 py-2 border'>
        <div className='flex items-center justify-between gap-1'>
          <span className='mr-12'>
            <label 
              title='Переименовать конституенту' 
              className='font-semibold underline cursor-pointer'
              onClick={handleRename}
            >
              ID
            </label>
            <b className='ml-2'>{alias}</b>
          </span>
          <span>
            <label 
              title='Изменить тип конституенты'
              className='font-semibold underline cursor-pointer'
              onClick={handleChangeType}
            >
              Тип
            </label>
            <span className='ml-2'>{type}</span>
          </span>
        </div>
        <TextArea id='term' label='Термин'
          placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
          rows={2}
          value={term}
          disabled={!isEditable}
          onChange={event => setTerm(event.target.value)}
        />
        <ExpressionEditor id='expression' label='Формальное выражение'
          placeholder='Родоструктурное выражение, задающее формальное определение'
          value={expression}
          disabled={!isEditable}
          onChange={event => setExpression(event.target.value)}
        />
        <TextArea id='definition' label='Текстовое определение'
          placeholder='Лингвистическая интерпретация формального выражения'
          rows={4}
          value={textDefinition}
          disabled={!isEditable}
          onChange={event => setTextDefinition(event.target.value)}
        />
        <TextArea id='convention' label='Конвенция / Комментарий'
          placeholder='Договоренность об интерпретации неопределяемых понятий или комментарий к производному понятию'
          rows={4}
          value={convention}
          disabled={!isEditable}
          onChange={event => setConvention(event.target.value)}
        />
        
        <div className='flex items-center justify-between gap-1 py-2 mt-2'>
          <SubmitButton text='Сохранить изменения' disabled={!isEditable} />
        </div>
      </form>
      <PrettyJson data={active || ''} />
      </div>
  );
}

export default ConstituentEditor;