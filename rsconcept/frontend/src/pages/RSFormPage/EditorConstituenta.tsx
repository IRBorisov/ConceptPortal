import { Dispatch, SetStateAction, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import MiniButton from '../../components/Common/MiniButton';
import ReferenceInput from '../../components/Common/ReferenceInput';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import HelpConstituenta from '../../components/Help/HelpConstituenta';
import { DumpBinIcon, HelpIcon, PenIcon, SaveIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import useWindowSize from '../../hooks/useWindowSize';
import { EditMode } from '../../models/miscelanious';
import { CstType, IConstituenta, ICstCreateData, ICstRenameData, ICstUpdateData } from '../../models/rsform';
import { SyntaxTree } from '../../models/rslang';
import { getCstTypificationLabel } from '../../utils/staticUI';
import EditorRSExpression from './EditorRSExpression';
import ViewSideConstituents from './elements/ViewSideConstituents';

// Max height of content for left enditor pane
const UNFOLDED_HEIGHT = '59.1rem';

const SIDELIST_HIDE_THRESHOLD = 1000;

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
  
  const [editMode, setEditMode] = useState(EditMode.TEXT);

  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');
  const [typification, setTypification] = useState('N/A');

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
      setTypification(activeCst ? getCstTypificationLabel(activeCst) : 'N/A');
    }
  }, [activeCst, onOpenEdit, schema]);

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
    };
    onCreateCst(data);
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

  return (
  <div className='flex w-full gap-2 mb-2 justify-stretch'>
    <form onSubmit={handleSubmit} className='min-w-[50rem] max-w-min px-4 py-2 border-y border-r'>
      <div className='relative w-full'>
      <div className='absolute top-0 right-0 flex items-start justify-between w-full'>
        <MiniButton
          tooltip='Редактировать словоформы термина'
          disabled={!isEnabled}
          dimensions='w-fit pl-[3.2rem] pt-[0.4rem]'
          noHover
          onClick={onEditTerm}
          icon={<PenIcon size={4} color={isEnabled ? 'text-primary' : ''} />}
        />
        <div className='flex items-center justify-center w-full gap-1'>
          <div className='font-semibold w-fit'>
            <span className=''>Конституента </span>
            <span className='ml-4'>{alias}</span>
          </div>
          <MiniButton
            tooltip='Переименовать конституенту'
            disabled={!isEnabled}
            noHover
            onClick={handleRename}
            icon={<PenIcon size={4} color={isEnabled ? 'text-primary' : ''} />}
          />
        </div>
        <div className='flex justify-end min-w-fit'>
          <MiniButton
            tooltip='Сохранить изменения'
            disabled={!isModified || !isEnabled}
            icon={<SaveIcon size={5} color={isModified && isEnabled ? 'text-primary' : ''}/>}
            onClick={() => handleSubmit()}
          />
          <MiniButton
            tooltip='Создать конституенты после данной'
            disabled={!isEnabled}
            onClick={handleCreateCst}
            icon={<SmallPlusIcon size={5} color={isEnabled ? 'text-success' : ''} />} 
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
      <div className='flex flex-col gap-2 mt-1'>
        <ReferenceInput id='term' label='Термин'
          placeholder='Обозначение, используемое в текстовых определениях данной схемы'
          rows={2}
          value={term}
          initialValue={activeCst?.term_raw ?? ''}
          resolved={activeCst?.term_resolved ?? ''}
          disabled={!isEnabled}
          spellCheck
          onChange={event => setTerm(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        <TextArea id='typification' label='Типизация'
          rows={1}
          value={typification}
          colorClass='clr-app'
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
          setTypification={setTypification}
        />
        <ReferenceInput id='definition' label='Текстовое определение'
          placeholder='Лингвистическая интерпретация формального выражения'
          rows={4}
          value={textDefinition}
          initialValue={activeCst?.definition_raw ?? ''}
          resolved={activeCst?.definition_resolved ?? ''}
          disabled={!isEnabled}
          spellCheck
          onChange={event => setTextDefinition(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        <TextArea id='convention' label='Конвенция / Комментарий'
          placeholder='Договоренность об интерпретации неопределяемого понятия&#x000D;&#x000A;Комментарий к производному понятию'
          rows={4}
          value={convention}
          disabled={!isEnabled}
          spellCheck
          onChange={event => setConvention(event.target.value)}
          onFocus={() => setEditMode(EditMode.TEXT)}
        />
        <div className='flex justify-center w-full mt-2'>
          <SubmitButton
            text='Сохранить изменения'
            disabled={!isModified || !isEnabled}
            icon={<SaveIcon size={6} />}
          />
        </div>
      </div>
    </form>
    {(windowSize.width ?? 0) >= SIDELIST_HIDE_THRESHOLD &&
    <div className='self-stretch w-full border'>
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
