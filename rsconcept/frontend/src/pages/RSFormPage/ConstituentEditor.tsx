import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import { DumpBinIcon, SaveIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { type CstType, EditMode, type ICstCreateData, ICstUpdateData } from '../../utils/models';
import { createAliasFor, getCstTypeLabel } from '../../utils/staticUI';
import ConstituentsSideList from './ConstituentsSideList';
import CreateCstModal from './CreateCstModal';
import ExpressionEditor from './ExpressionEditor';
import { RSFormTabsList } from './RSFormTabs';

function ConstituentEditor() {
  const navigate = useNavigate();
  const {
    activeCst, activeID, schema, setActiveID, processing, isEditable,
    cstDelete, cstUpdate, cstCreate
  } = useRSForm();

  const [showCstModal, setShowCstModal] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [editMode, setEditMode] = useState(EditMode.TEXT);

  const [alias, setAlias] = useState('');
  const [type, setType] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');
  const [typification, setTypification] = useState('N/A');

  const isEnabled = useMemo(() => activeCst && isEditable, [activeCst, isEditable]);

  useLayoutEffect(() => {
    if (schema && schema?.items.length > 0) {
      setActiveID((prev) => (prev ?? schema.items[0].id ?? undefined));
    }
  }, [schema, setActiveID]);

  useLayoutEffect(() => {
    if (!activeCst) {
      setIsModified(false);
      return;
    }
    setIsModified(
      activeCst.term.raw !== term ||
      activeCst.definition.text.raw !== textDefinition ||
      activeCst.convention !== convention ||
      activeCst.definition.formal !== expression
    );
  }, [activeCst, activeCst?.term, activeCst?.definition.formal,
    activeCst?.definition.text.raw, activeCst?.convention,
    term, textDefinition, expression, convention]);

  useLayoutEffect(() => {
    if (activeCst) {
      setAlias(activeCst.alias);
      setType(getCstTypeLabel(activeCst.cstType));
      setConvention(activeCst.convention ?? '');
      setTerm(activeCst.term?.raw ?? '');
      setTextDefinition(activeCst.definition?.text?.raw ?? '');
      setExpression(activeCst.definition?.formal ?? '');
      setTypification(activeCst?.parse?.typification || 'N/A');
    }
  }, [activeCst]);

  const handleSubmit =
  (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeID || processing) {
      return;
    }
    const data: ICstUpdateData = {
      id: activeID,
      alias: alias,
      convention: convention,
      definition_formal: expression,
      definition_raw: textDefinition,
      term_raw: term
    };
    cstUpdate(data, () => { toast.success('Изменения сохранены'); });
  };

  const handleDelete = useCallback(
  () => {
    if (!activeID || !schema?.items || !window.confirm('Вы уверены, что хотите удалить конституенту?')) {
      return;
    }
    const data = {
      items: [{ id: activeID }]
    }
    const index = schema.items.findIndex((cst) => cst.id === activeID);
    if (index !== -1 && index + 1 < schema.items.length) {
      setActiveID(schema.items[index + 1].id);
    }
    cstDelete(data, () => toast.success('Конституента удалена'));
  }, [activeID, schema, setActiveID, cstDelete]);

  const handleAddNew = useCallback(
  (type?: CstType) => {
    if (!activeID || !schema?.items) {
      return;
    }
    if (!type) {
      setShowCstModal(true);
    } else {
      const data: ICstCreateData = {
        cst_type: type,
        alias: createAliasFor(type, schema),
        insert_after: activeID
      }
      cstCreate(data, newCst => {
        navigate(`/rsforms/${schema.id}?tab=${RSFormTabsList.CST_EDIT}&active=${newCst.id}`);
        toast.success(`Конституента добавлена: ${newCst.alias}`);
      });
    }
  }, [activeID, schema, cstCreate, navigate]);

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
        hideWindow={() => { setShowCstModal(false); }}
        onCreate={handleAddNew}
        defaultType={activeCst?.cstType as CstType}
      />
      <form onSubmit={handleSubmit} className='flex-grow min-w-[50rem] max-w-min px-4 py-2 border'>
        <div className='flex items-start justify-between'>
            <button type='submit'
              title='Сохранить изменения'
              className='px-1 py-1 font-bold rounded whitespace-nowrap disabled:cursor-not-allowed clr-btn-primary'
              disabled={!isModified || !isEnabled}
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
              disabled={!isEnabled}
              onClick={() => { handleAddNew(); }}
            >
              <SmallPlusIcon size={5} color={isEnabled ? 'text-green' : ''} />
            </button>
            <button type='button'
              title='Удалить редактируемую конституенту'
              className='px-1 py-1 font-bold rounded-full whitespace-nowrap disabled:cursor-not-allowed clr-btn-clear'
              disabled={!isEnabled}
              onClick={handleDelete}
            >
              <DumpBinIcon size={5} color={isEnabled ? 'text-red' : ''} />
            </button>
          </div>
        </div>
        <TextArea id='term' label='Термин'
          placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
          rows={2}
          value={term}
          disabled={!isEnabled}
          spellCheck
          onChange={event => { setTerm(event.target.value); }}
          onFocus={() => { setEditMode(EditMode.TEXT); }}
        />
        <TextArea id='typification' label='Типизация'
          rows={1}
          value={typification}
          disabled
        />
        <ExpressionEditor id='expression' label='Формальное выражение'
          placeholder='Родоструктурное выражение, задающее формальное определение'
          value={expression}
          disabled={!isEnabled}
          isActive={editMode === EditMode.RSLANG}
          toggleEditMode={() => { setEditMode(EditMode.RSLANG); }}
          onChange={event => { setExpression(event.target.value); }}
          setValue={setExpression}
          setTypification={setTypification}
        />
        <TextArea id='definition' label='Текстовое определение'
          placeholder='Лингвистическая интерпретация формального выражения'
          rows={4}
          value={textDefinition}
          disabled={!isEnabled}
          spellCheck
          onChange={event => { setTextDefinition(event.target.value); }}
          onFocus={() => { setEditMode(EditMode.TEXT); }}
        />
        <TextArea id='convention' label='Конвенция / Комментарий'
          placeholder='Договоренность об интерпретации неопределяемого понятия&#x000D;&#x000A;Комментарий к производному понятию'
          rows={4}
          value={convention}
          disabled={!isEnabled}
          spellCheck
          onChange={event => { setConvention(event.target.value); }}
          onFocus={() => { setEditMode(EditMode.TEXT); }}
        />
        <div className='flex justify-center w-full mt-2'>
          <SubmitButton
            text='Сохранить изменения'
            disabled={!isModified || !isEnabled}
            icon={<SaveIcon size={6} />}
          />
        </div>
      </form>
      <ConstituentsSideList expression={expression}/>
    </div>
  );
}

export default ConstituentEditor;
