import { useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Divider from '../../components/Common/Divider';
import MiniButton from '../../components/Common/MiniButton';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import { DumpBinIcon, HelpIcon, SaveIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { type CstType, EditMode, ICstUpdateData, SyntaxTree } from '../../utils/models';
import { getCstTypeLabel, getCstTypificationLabel, mapStatusInfo } from '../../utils/staticUI';
import EditorRSExpression from './EditorRSExpression';
import ViewSideConstituents from './elements/ViewSideConstituents';

interface EditorConstituentaProps {
  activeID?: number
  onOpenEdit: (cstID: number) => void
  onShowAST: (expression: string, ast: SyntaxTree) => void
  onCreateCst: (selectedID: number | undefined, type: CstType | undefined) => void
  onDeleteCst: (selected: number[], callback?: (items: number[]) => void) => void
}

function EditorConstituenta({ activeID, onShowAST, onCreateCst, onOpenEdit, onDeleteCst }: EditorConstituentaProps) {
  const { schema, processing, isEditable, cstUpdate } = useRSForm();
  const activeCst = useMemo(
  () => {
    return schema?.items?.find((cst) => cst.id === activeID);
  }, [schema?.items, activeID]);

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
      setTypification(activeCst ? getCstTypificationLabel(activeCst) : 'N/A');
    } else if (schema && schema?.items.length > 0) {
      onOpenEdit(schema.items[0].id);
    }
  }, [activeCst, onOpenEdit, schema]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
  }

  function handleDelete() {
    if (!schema || !activeID) {
      return;
    }
    onDeleteCst([activeID]);
  }

  function handleCreateCst() {
    if (!activeID || !schema) {
      return;
    }
    onCreateCst(activeID, activeCst?.cstType);
  }

  function handleRename() {
    toast.info('Переименование в разработке');
  }

  function handleChangeType() {
    toast.info('Изменение типа в разработке');
  }

  return (
    <div className='flex items-stretch w-full gap-2 mb-2'>
      <form onSubmit={handleSubmit} className='flex-grow min-w-[50rem] max-w-min max-h-fit px-4 py-2 border'>
        <div className='flex items-start justify-between'>
            <button type='submit'
              title='Сохранить изменения'
              className='px-1 py-1 font-bold border rounded whitespace-nowrap disabled:cursor-not-allowed clr-btn-primary'
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
            <MiniButton
              tooltip='Создать конституенты после данной'
              disabled={!isEnabled}
              onClick={handleCreateCst}
              icon={<SmallPlusIcon size={5} color={isEnabled ? 'text-green' : ''} />} 
            />
            <MiniButton
              tooltip='Удалить редактируемую конституенту'
              disabled={!isEnabled}
              onClick={handleDelete}
              icon={<DumpBinIcon size={5} color={isEnabled ? 'text-red' : ''} />}
            />
            <div id='cst-help' className='flex items-center ml-[0.25rem]'>
              <HelpIcon color='text-primary' size={5} />
            </div>
            <ConceptTooltip anchorSelect='#cst-help'>
              <div className='max-w-[35rem]'>
                <h1>Подсказки</h1>
                <p><b className='text-red'>Изменения сохраняются ПОСЛЕ нажатия на кнопку снизу или слева вверху</b></p>
                <p><b>Клик на формальное выражение</b> - обратите внимание на кнопки снизу.<br/>Для каждой есть горячая клавиша в подсказке</p>
                <p><b>Список конституент справа</b> - обратите внимание на настройки фильтрации</p>
                <p>- слева от ввода текста настраивается набор атрибутов конституенты</p>
                <p>- справа от ввода текста настраивается список конституент, которые фильтруются</p>
                <p>- текущая конституента выделена цветом строки</p>
                <p>- двойной клик / Alt + клик - выбор редактируемой конституенты</p>
                <p>- при наведении на ID конституенты отображаются ее атрибуты</p>
                <p>- столбец "Описание" содержит один из непустых текстовых атрибутов</p>
                <Divider margins='mt-2' />
                <h1>Статусы</h1>
                { [... mapStatusInfo.values()].map(info => {
                    return (<p className='py-1'>
                      <span className={`inline-block font-semibold min-w-[4rem] text-center border ${info.color}`}>
                        {info.text}
                      </span>
                      <span> - </span>
                      <span>
                        {info.tooltip}
                      </span>
                    </p>);
                })}
              </div>
            </ConceptTooltip>
          </div>
        </div>
        <TextArea id='term' label='Термин'
          placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
          rows={2}
          value={term}
          disabled={!isEnabled}
          spellCheck
          onChange={event => setTerm(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        <TextArea id='typification' label='Типизация'
          rows={1}
          value={typification}
          disabled
        />
        <EditorRSExpression id='expression' label='Формальное выражение'
          activeCst={activeCst}
          placeholder='Родоструктурное выражение, задающее формальное определение'
          value={expression}
          disabled={!isEnabled}
          isActive={editMode === EditMode.RSLANG}
          toggleEditMode={() => setEditMode(EditMode.RSLANG)}
          onShowAST={onShowAST}
          onChange={newValue => setExpression(newValue)}
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
      <ViewSideConstituents
        expression={expression}
        activeID={activeID}
        onOpenEdit={onOpenEdit}
      />
    </div>
  );
}

export default EditorConstituenta;
