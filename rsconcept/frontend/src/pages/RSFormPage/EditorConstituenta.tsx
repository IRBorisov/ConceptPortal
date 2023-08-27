import { useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import MiniButton from '../../components/Common/MiniButton';
import ReferenceInput from '../../components/Common/ReferenceInput';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import HelpConstituenta from '../../components/Help/HelpConstituenta';
import { DumpBinIcon, HelpIcon, PenIcon, SaveIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import useModificationPrompt from '../../hooks/useModificationPrompt';
import { CstType, EditMode, ICstCreateData, ICstRenameData, ICstUpdateData, SyntaxTree } from '../../utils/models';
import { getCstTypificationLabel } from '../../utils/staticUI';
import EditorRSExpression from './EditorRSExpression';
import ViewSideConstituents from './elements/ViewSideConstituents';

// Max height of content for left enditor pane
const UNFOLDED_HEIGHT = '59.1rem';

interface EditorConstituentaProps {
  activeID?: number
  onOpenEdit: (cstID: number) => void
  onShowAST: (expression: string, ast: SyntaxTree) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onRenameCst: (initial: ICstRenameData) => void
  onDeleteCst: (selected: number[], callback?: (items: number[]) => void) => void
}

function EditorConstituenta({ activeID, onShowAST, onCreateCst, onRenameCst, onOpenEdit, onDeleteCst }: EditorConstituentaProps) {
  const { schema, processing, isEditable, cstUpdate } = useRSForm();
  const activeCst = useMemo(
  () => {
    return schema?.items?.find((cst) => cst.id === activeID);
  }, [schema?.items, activeID]);

  const { isModified, setIsModified } = useModificationPrompt();
  
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
      activeCst.term.raw !== term ||
      activeCst.definition.text.raw !== textDefinition ||
      activeCst.convention !== convention ||
      activeCst.definition.formal !== expression
    );
  }, [activeCst, activeCst?.term, activeCst?.definition.formal,
    activeCst?.definition.text.raw, activeCst?.convention,
    term, textDefinition, expression, convention, setIsModified]);

  useLayoutEffect(
  () => {
    if (activeCst) {
      setAlias(activeCst.alias);
      setConvention(activeCst.convention ?? '');
      setTerm(activeCst.term?.raw ?? '');
      setTextDefinition(activeCst.definition?.text?.raw ?? '');
      setExpression(activeCst.definition?.formal ?? '');
      setTypification(activeCst ? getCstTypificationLabel(activeCst) : 'N/A');
    } else if (schema && schema?.items.length > 0) {
      onOpenEdit(schema.items[0].id);
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
      cst_type: activeCst?.cstType ?? CstType.BASE,
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
      cst_type: activeCst.cstType
    };
    onRenameCst(data);
  }

  return (
    <div className='flex items-stretch w-full gap-2 mb-2 justify-stretch'>
      <form onSubmit={handleSubmit} className='min-w-[50rem] max-w-min px-4 py-2 border-y border-r clr-border'>
        <div className='relative'>
          <div className='absolute top-0 left-0'>
        <MiniButton 
          tooltip='Сохранить изменения'
          disabled={!isModified || !isEnabled}
          icon={<SaveIcon size={6} color={isModified && isEnabled ? 'text-primary' : ''}/>}
          onClick={() => handleSubmit()}
        >
        </MiniButton>
        </div>
        </div>
        <div className='relative'>
        <div className='absolute top-0 right-0 flex justify-end'>
          <MiniButton
            tooltip='Удалить редактируемую конституенту'
            disabled={!isEnabled}
            onClick={handleDelete}
            icon={<DumpBinIcon size={5} color={isEnabled ? 'text-red' : ''} />}
          />
          <MiniButton
            tooltip='Создать конституенты после данной'
            disabled={!isEnabled}
            onClick={handleCreateCst}
            icon={<SmallPlusIcon size={5} color={isEnabled ? 'text-green' : ''} />} 
          />
          <div id='cst-help' className='flex items-center ml-[6px]'>
            <HelpIcon color='text-primary' size={5} />
          </div>
          <ConceptTooltip anchorSelect='#cst-help'>
            <HelpConstituenta />
          </ConceptTooltip>
        </div>
        </div>
        <div className='flex items-center justify-center w-full pr-10'>
          <div className='font-semibold w-fit'>
            <span className=''>Конституента </span>
            <span className='ml-4'>{alias}</span>
          </div>
          <MiniButton
            tooltip='Переименовать конституету'
            disabled={!isEnabled}
            noHover
            onClick={handleRename}
            icon={<PenIcon size={4} color={isEnabled ? 'text-primary' : ''} />}
          />
        </div>
        <ReferenceInput id='term' label='Термин'
          placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
          rows={2}
          value={term}
          initialValue={activeCst?.term.raw ?? ''}
          resolved={activeCst?.term.resolved ?? ''}
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
        <ReferenceInput id='definition' label='Текстовое определение'
          placeholder='Лингвистическая интерпретация формального выражения'
          rows={4}
          value={textDefinition}
          initialValue={activeCst?.definition.text.raw ?? ''}
          resolved={activeCst?.definition.text.resolved ?? ''}
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
        <div className='flex justify-center w-full mt-4 mb-2'>
          <SubmitButton
            text='Сохранить изменения'
            disabled={!isModified || !isEnabled}
            icon={<SaveIcon size={6} />}
          />
        </div>
      </form>
      <div className='self-stretch w-full pb-1 border'>
        <ViewSideConstituents
          expression={expression}
          baseHeight={UNFOLDED_HEIGHT}
          activeID={activeID}
          onOpenEdit={onOpenEdit}
        />
      </div>
    </div>
  );
}

export default EditorConstituenta;
