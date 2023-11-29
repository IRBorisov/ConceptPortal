import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import { useRSForm } from '../../../context/RSFormContext';
import useWindowSize from '../../../hooks/useWindowSize';
import { CstType, IConstituenta, ICstCreateData, ICstRenameData } from '../../../models/rsform';
import { SyntaxTree } from '../../../models/rslang';
import { globalIDs } from '../../../utils/constants';
import ConstituentaToolbar from './ConstituentaToolbar';
import FormConstituenta from './FormConstituenta';
import ViewSideConstituents from './ViewSideConstituents';

// Max height of content for left enditor pane.
const UNFOLDED_HEIGHT = '59.1rem';

// Thershold window width to hide side constituents list.
const SIDELIST_HIDE_THRESHOLD = 1100; // px

interface EditorConstituentaProps {
  activeID?: number
  activeCst?: IConstituenta | undefined
  isModified: boolean
  setIsModified: Dispatch<SetStateAction<boolean>>

  onOpenEdit: (cstID: number) => void
  onShowAST: (expression: string, ast: SyntaxTree) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onRenameCst: (initial: ICstRenameData) => void
  onEditTerm: () => void
  onDeleteCst: (selected: number[], callback?: (items: number[]) => void) => void
  onTemplates: (insertAfter?: number) => void
}

function EditorConstituenta({
  isModified, setIsModified, activeID, activeCst, onEditTerm,
  onShowAST, onCreateCst, onRenameCst, onOpenEdit, onDeleteCst, onTemplates
}: EditorConstituentaProps) {
  const windowSize = useWindowSize();
  const { schema, editorMode } = useRSForm();

  const [toggleReset, setToggleReset] = useState(false);

  const readyForEdit = useMemo(() => (!!activeCst && editorMode), [activeCst, editorMode]);

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

  function initiateSubmit() {
    const element = document.getElementById(globalIDs.constituenta_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }
  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey && event.code === 'KeyS') {
      if (isModified) {
        initiateSubmit();
      }
      event.preventDefault();
    }
  }

  return (
  <div tabIndex={-1}
    className='max-w-[1500px]'
    onKeyDown={handleInput}
  >
    <ConstituentaToolbar
      editorMode={readyForEdit}
      isModified={isModified}
    
      onSubmit={initiateSubmit}
      onReset={() => setToggleReset(prev => !prev)}
    
      onDelete={handleDelete}
      onClone={handleCloneCst}
      onCreate={handleCreateCst}
      onTemplates={() => onTemplates(activeID)}
    />
    <div className='flex justify-start'>
      <div className='min-w-[47.8rem] max-w-[47.8rem] px-4 py-1'>
        <FormConstituenta id={globalIDs.constituenta_editor}
          constituenta={activeCst}
          isModified={isModified}
          toggleReset={toggleReset}
          
          setIsModified={setIsModified}
          onShowAST={onShowAST}
          onEditTerm={onEditTerm}
          onRenameCst={onRenameCst}
        />
      </div>
      {(windowSize.width && windowSize.width >= SIDELIST_HIDE_THRESHOLD) ?
      <div className='w-full mt-[2.25rem] border h-fit'>
        <ViewSideConstituents
          expression={activeCst?.definition_formal ?? ''}
          baseHeight={UNFOLDED_HEIGHT}
          activeID={activeID}
          onOpenEdit={onOpenEdit}
        />
      </div> : null}
    </div>
  </div>);
}

export default EditorConstituenta;
