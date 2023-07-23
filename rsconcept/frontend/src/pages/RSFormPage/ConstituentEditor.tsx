import { useCallback, useEffect, useState } from 'react';
import { useRSForm } from '../../context/RSFormContext';
import { CstType, EditMode, INewCstData } from '../../utils/models';
import { toast } from 'react-toastify';
import TextArea from '../../components/Common/TextArea';
import ExpressionEditor from './ExpressionEditor';
import SubmitButton from '../../components/Common/SubmitButton';
import { createAliasFor, getCstTypeLabel } from '../../utils/staticUI';
import ConstituentsSideList from './ConstituentsSideList';
import { DumpBinIcon, SaveIcon, SmallPlusIcon } from '../../components/Icons';
import CreateCstModal from './CreateCstModal';
import { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { RSFormTabsList } from './RSFormTabs';

function ConstituentEditor() {
  const navigate = useNavigate();
  const { 
    active, schema, setActive, processing, isEditable, reload,
    cstDelete, cstUpdate, cstCreate
  } = useRSForm();

  const [showCstModal, setShowCstModal] = useState(false);
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
  
  const handleSubmit = 
  async (event: React.FormEvent<HTMLFormElement>) => {
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
      cstUpdate(data)
      .then(() => {
        toast.success('Изменения сохранены');
        reload();
      });
    }
  };

  const handleDelete = useCallback(
  async () => {
    if (!active || !window.confirm('Вы уверены, что хотите удалить конституенту?')) {
      return;
    }
    const data = { 
      'items': [active.entityUID]
    }
    const index = schema?.items?.indexOf(active)
    await cstDelete(data);
    if (schema?.items && index && index + 1 < schema?.items?.length) {
      setActive(schema?.items[index + 1]);
    }
    toast.success(`Конституента удалена: ${active.alias}`);
    reload();
  }, [active, schema, setActive, cstDelete, reload]);

  const handleAddNew = useCallback(
  async (csttype?: CstType) => {
    if (!active || !schema) {
      return;
    }
    if (!csttype) {
      setShowCstModal(true);
    } else {
      const data: INewCstData = { 
        'csttype': csttype,
        'alias': createAliasFor(csttype, schema!),
        'insert_after': active.entityUID
      }
      cstCreate(data, (response: AxiosResponse) => {
        navigate(`/rsforms/${schema.id}?tab=${RSFormTabsList.CST_EDIT}&active=${response.data['entityUID']}`);
        window.location.reload();
      });      
    }
  }, [active, schema, cstCreate, navigate]);

  const handleRename = useCallback(() => {
    toast.info('Переименование в разработке');
  }, []);

  const handleChangeType = useCallback(() => {
    toast.info('Изменение типа в разработке');
  }, []);


  return (
    <div className='flex items-start w-full gap-2'>
      <CreateCstModal
        show={showCstModal}
        toggle={() => setShowCstModal(!showCstModal)}
        onCreate={handleAddNew}
        defaultType={active?.cstType as CstType}
      />
      <form onSubmit={handleSubmit} className='flex-grow min-w-[50rem] max-w-min px-4 py-2 border'>
        <div className='flex items-start justify-between'>
            <button type='submit'
              title='Сохранить изменения'
              className='px-1 py-1 font-bold rounded whitespace-nowrap disabled:cursor-not-allowed clr-btn-primary'
              disabled={!isEditable}
            >
              <SaveIcon size={5} />
            </button>
          <div className='flex items-start justify-center w-full gap-4'>
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
          <div className='flex justify-end'>
            <button type='button'
              title='Создать конституенты после данной'
              className='px-1 py-1 font-bold rounded-full whitespace-nowrap disabled:cursor-not-allowed clr-btn-clear'
              disabled={!isEditable}
              onClick={() => handleAddNew()}
            >
              <SmallPlusIcon size={5} color={isEditable ? 'text-green': ''} />
            </button>
            <button type='button'
              title='Удалить редактируемую конституенту'
              className='px-1 py-1 font-bold rounded-full whitespace-nowrap disabled:cursor-not-allowed clr-btn-clear'
              disabled={!isEditable}
              onClick={handleDelete}
            >
              <DumpBinIcon size={5} color={isEditable ? 'text-red': ''} />
            </button>
          </div>
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
          setValue={setExpression}
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
          placeholder='Договоренность об интерпретации неопределяемого понятия&#x000D;&#x000A;Комментарий к производному понятию'
          rows={4}
          value={convention}
          disabled={!isEditable}
          spellCheck
          onChange={event => setConvention(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        <div className='flex justify-center w-full mt-2'>
          <SubmitButton
            text='Сохранить изменения'
            disabled={!isEditable}
            icon={<SaveIcon size={6} />}
          />
        </div>
      </form>
      <ConstituentsSideList expression={expression}/>
    </div>
  );
}

export default ConstituentEditor;