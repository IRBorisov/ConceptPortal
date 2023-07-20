import { useCallback, useEffect, useState } from 'react';
import { useRSForm } from '../../context/RSFormContext';
import { EditMode, IConstituenta } from '../../utils/models';
import { toast } from 'react-toastify';
import TextArea from '../../components/Common/TextArea';
import ExpressionEditor from './ExpressionEditor';
import SubmitButton from '../../components/Common/SubmitButton';
import { getCstTypeLabel } from '../../utils/staticUI';
import ConstituentsSideList from './ConstituentsSideList';

function ConstituentEditor() {
  const { 
    active, schema, setActive, processing, cstUpdate, isEditable, reload
  } = useRSForm();

  const [editMode, setEditMode] = useState(EditMode.TEXT);

  const [alias, setAlias] = useState('');
  const [type, setType] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');
  const [typification, setTypification] = useState('N/A');

  useEffect(() => {
    if (schema?.items && schema?.items.length > 0) {
      setActive((prev) => (prev || schema?.items![0]));
    }
  }, [schema, setActive])

  useEffect(() => {
    if (active) {
      setAlias(active.alias);
      setType(getCstTypeLabel(active.cstType));
      setConvention(active.convention || '');
      setTerm(active.term?.raw || '');
      setTextDefinition(active.definition?.text?.raw || '');
      setExpression(active.definition?.formal || '');
      setTypification(active?.parse?.typification || 'N/A');
    }
  }, [active]);
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!processing) {
      const data = {
        'alias': alias,
        'convention': convention,
        'definition_formal': expression,
        'definition_text': {
          'raw': textDefinition,
          'resolved': '',
        },
        'term': {
          'raw': term,
          'resolved': '',
          'forms': active?.term?.forms || [],
        }
      };
      cstUpdate(data, (response) => {
        console.log(response);
        toast.success('Изменения сохранены');
        reload();
      });
    }
  };

  const handleRename = useCallback(() => {
    toast.info('Переименование в разработке');
  }, []);

  const handleChangeType = useCallback(() => {
    toast.info('Изменение типа в разработке');
  }, []);


  return (
    <div className='flex items-start w-full gap-2'>
      <form onSubmit={handleSubmit} className='flex-grow min-w-[50rem] max-w-min px-4 py-2 border'>
        <div className='flex items-start justify-between gap-1'>
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
          <div className='mt-2 h-[1rem]'>
            <SubmitButton text='Сохранить изменения' disabled={!isEditable} />
          </div>
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
          spellCheck
          onChange={event => setTerm(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        <TextArea id='typification' label='Типизация'
          rows={1}
          value={typification}
          disabled
        />
        <ExpressionEditor id='expression' label='Формальное выражение'
          placeholder='Родоструктурное выражение, задающее формальное определение'
          value={expression}
          disabled={!isEditable}
          isActive={editMode==='rslang'}
          toggleEditMode={() => setEditMode(EditMode.RSLANG)}
          onChange={event => setExpression(event.target.value)}
          setTypification={setTypification}
        />
        <TextArea id='definition' label='Текстовое определение'
          placeholder='Лингвистическая интерпретация формального выражения'
          rows={4}
          value={textDefinition}
          disabled={!isEditable}
          spellCheck
          onChange={event => setTextDefinition(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        <TextArea id='convention' label='Конвенция / Комментарий'
          placeholder='Договоренность об интерпретации неопределяемых понятий или комментарий к производному понятию'
          rows={4}
          value={convention}
          disabled={!isEditable}
          spellCheck
          onChange={event => setConvention(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        
      </form>
      <ConstituentsSideList expression={expression}/>
    </div>
  );
}

export default ConstituentEditor;