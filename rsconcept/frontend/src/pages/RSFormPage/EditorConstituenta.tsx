import { Dispatch, SetStateAction, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import MiniButton from '../../components/Common/MiniButton';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import HelpConstituenta from '../../components/Help/HelpConstituenta';
import { ArrowsRotateIcon, CloneIcon, DumpBinIcon, EditIcon, HelpIcon, SaveIcon, SmallPlusIcon } from '../../components/Icons';
import RefsInput from '../../components/RefsInput';
import { useRSForm } from '../../context/RSFormContext';
import useWindowSize from '../../hooks/useWindowSize';
import { CstType, IConstituenta, ICstCreateData, ICstRenameData, ICstUpdateData } from '../../models/rsform';
import { SyntaxTree } from '../../models/rslang';
import { labelCstTypification } from '../../utils/labels';
import EditorRSExpression from './EditorRSExpression';
import ViewSideConstituents from './elements/ViewSideConstituents';

// Max height of content for left enditor pane
const UNFOLDED_HEIGHT = '59.1rem';

const SIDELIST_HIDE_THRESHOLD = 1100;

interface EditorConstituentaProps {
  activeID?: number
  activeCst?: IConstituenta | undefined
  onOpenEdit: (cstID: number) => void
  onShowAST: (expression: string, ast: SyntaxTree) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onRenameCst: (initial: ICstRenameData) => void
  onEditTerm: () => void
  onDeleteCst: (selected: number[], callback?: (items: number[]) => void) => void
  isModified: boolean
  setIsModified: Dispatch<SetStateAction<boolean>>
}

function EditorConstituenta({
  isModified, setIsModified, activeID, activeCst, onEditTerm,
  onShowAST, onCreateCst, onRenameCst, onOpenEdit, onDeleteCst
}: EditorConstituentaProps) {
  const windowSize = useWindowSize();
  const { schema, processing, isEditable, cstUpdate } = useRSForm();

  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');
  const [typification, setTypification] = useState('N/A');
  const [toggleReset, setToggleReset] = useState(false);

  const isEnabled = useMemo(() => activeCst && isEditable, [activeCst, isEditable]);

  useLayoutEffect(
  () => {
    if (!activeCst) {
      setIsModified(false);
      return;
    }
    setIsModified(
      activeCst.term_raw !== term ||
      activeCst.definition_raw !== textDefinition ||
      activeCst.convention !== convention ||
      activeCst.definition_formal !== expression
    );
    return () => setIsModified(false);
  }, [activeCst, activeCst?.term_raw, activeCst?.definition_formal,
    activeCst?.definition_raw, activeCst?.convention,
    term, textDefinition, expression, convention, setIsModified]);

  useLayoutEffect(
  () => {
    if (activeCst) {
      setAlias(activeCst.alias);
      setConvention(activeCst.convention || '');
      setTerm(activeCst.term_raw || '');
      setTextDefinition(activeCst.definition_raw || '');
      setExpression(activeCst.definition_formal || '');
      setTypification(activeCst ? labelCstTypification(activeCst) : 'N/A');
    }
  }, [activeCst, onOpenEdit, schema, toggleReset]);

  function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    if (event) {
      event.preventDefault();
    }
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
    cstUpdate(data, () => toast.success('Изменения сохранены'));
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
    const data: ICstCreateData = {
      insert_after: activeID,
      cst_type: activeCst?.cst_type ?? CstType.BASE,
      alias: '',
      term_raw: '',
      definition_formal: '',
      definition_raw: '',
      convention: '',
      term_forms: []
    };
    onCreateCst(data);
  }

  function handleCloneCst() {
    if (!activeID || !schema || !activeCst) {
      return;
    }
    const data: ICstCreateData = {
      insert_after: activeID,
      cst_type: activeCst.cst_type,
      alias: '',
      term_raw: activeCst.term_raw,
      definition_formal: activeCst.definition_formal,
      definition_raw: activeCst.definition_raw,
      convention: activeCst.convention,
      term_forms: activeCst.term_forms
    };
    onCreateCst(data, true);
  }

  function handleRename() {
    if (!activeID || !activeCst) {
      return;
    }
    const data: ICstRenameData = {
      id: activeID,
      alias: activeCst?.alias,
      cst_type: activeCst.cst_type
    };
    onRenameCst(data);
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey && event.code === 'KeyS') {
      if (isModified) {
        handleSubmit();
      }
      event.preventDefault();
    }
  }

  return (
  <div className='flex max-w-[1500px] gap-2' tabIndex={0} onKeyDown={handleInput}>
    <form onSubmit={handleSubmit} className='min-w-[50rem] max-w-[50rem] px-4 py-1'>
      <div className='relative w-full'>
      <div className='absolute top-0 right-0 flex items-start justify-between w-full'>
        {activeCst && 
        <MiniButton
          tooltip={`Редактировать словоформы термина: ${activeCst.term_forms.length}`}
          disabled={!isEnabled}
          dimensions='w-fit ml-[3.2rem] pt-[0.3rem]'
          noHover
          onClick={onEditTerm}
          icon={<EditIcon size={4} color={isEnabled ? 'text-primary' : ''} />}
        />}
        <div className='flex items-center justify-center w-full pl-[4rem]'>
          <div className='font-semibold pointer-events-none w-fit'>
            <span className='small-caps'>Конституента </span>
            <span className='ml-1 small-caps'>{alias}</span>
          </div>
          <MiniButton
            tooltip='Переименовать конституенту'
            disabled={!isEnabled}
            noHover
            onClick={handleRename}
            icon={<EditIcon size={4} color={isEnabled ? 'text-primary' : ''} />}
          />
        </div>
        <div className='flex items-center justify-end'>
          <MiniButton
            tooltip='Сохранить изменения'
            disabled={!isModified || !isEnabled}
            icon={<SaveIcon size={5} color={isModified && isEnabled ? 'text-primary' : ''}/>}
            onClick={() => handleSubmit()}
          />
          <MiniButton
            tooltip='Сборсить несохраненные изменения'
            disabled={!isEnabled || !isModified}
            onClick={() => setToggleReset(prev => !prev)}
            icon={<ArrowsRotateIcon size={5} color={isEnabled && isModified ? 'text-primary' : ''} />}
          />
          <MiniButton
            tooltip='Создать конституенту после данной'
            disabled={!isEnabled}
            onClick={handleCreateCst}
            icon={<SmallPlusIcon size={5} color={isEnabled ? 'text-success' : ''} />} 
          />
          <MiniButton
            tooltip='Клонировать конституенту'
            disabled={!isEnabled}
            onClick={handleCloneCst}
            icon={<CloneIcon size={5} color={isEnabled ? 'text-success' : ''} />} 
          />
          <MiniButton
            tooltip='Удалить редактируемую конституенту'
            disabled={!isEnabled}
            onClick={handleDelete}
            icon={<DumpBinIcon size={5} color={isEnabled ? 'text-warning' : ''} />}
          />
          <div id='cst-help' className='px-1 py-1'>
            <HelpIcon color='text-primary' size={5} />
          </div>
          <ConceptTooltip anchorSelect='#cst-help' offset={4}>
            <HelpConstituenta />
          </ConceptTooltip>
        </div>
      </div>
      </div>
      <div className='flex flex-col gap-3 mt-1'>
        <RefsInput id='term' label='Термин'
          placeholder='Обозначение, используемое в текстовых определениях данной схемы'
          height='2.1rem'
          items={schema?.items}
          value={term}
          initialValue={activeCst?.term_raw ?? ''}
          resolved={activeCst?.term_resolved ?? ''}
          editable={isEnabled}
          onChange={newValue => setTerm(newValue)}
        />
        <TextArea id='typification' label='Типизация'
          dense
          rows={1}
          value={typification}
          colors='clr-app'
          disabled
        />
        <EditorRSExpression id='expression' label='Формальное определение'
          activeCst={activeCst}
          placeholder='Родоструктурное выражение, задающее формальное определение'
          value={expression}
          disabled={!isEnabled}
          toggleReset={toggleReset}
          onShowAST={onShowAST}
          onChange={newValue => setExpression(newValue)}
          setTypification={setTypification}
        />
        <RefsInput id='definition' label='Текстовое определение'
          placeholder='Лингвистическая интерпретация формального выражения'
          height='4.8rem'
          items={schema?.items}
          value={textDefinition}
          initialValue={activeCst?.definition_raw ?? ''}
          resolved={activeCst?.definition_resolved ?? ''}
          editable={isEnabled}
          onChange={newValue => setTextDefinition(newValue)}
        />
        <TextArea id='convention' label='Конвенция / Комментарий'
          placeholder='Договоренность об интерпретации неопределяемого понятия&#x000D;&#x000A;Комментарий к производному понятию'
          rows={2}
          value={convention}
          disabled={!isEnabled}
          spellCheck
          onChange={event => setConvention(event.target.value)}
        />
        <div className='flex justify-center w-full'>
          <SubmitButton
            text='Сохранить изменения'
            disabled={!isModified || !isEnabled}
            icon={<SaveIcon size={6} />}
          />
        </div>
      </div>
    </form>
    {(windowSize.width ?? 0) >= SIDELIST_HIDE_THRESHOLD &&
    <div className='w-full mt-[2.25rem] border h-fit'>
      <ViewSideConstituents
        expression={expression}
        baseHeight={UNFOLDED_HEIGHT}
        activeID={activeID}
        onOpenEdit={onOpenEdit}
      />
    </div>}
  </div>);
}

export default EditorConstituenta;
