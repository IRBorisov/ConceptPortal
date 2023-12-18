'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import { useRSForm } from '@/context/RSFormContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { CstType, IConstituenta, ICstCreateData, ICstRenameData } from '@/models/rsform';
import { globalIDs } from '@/utils/constants';

import ViewConstituents from '../ViewConstituents';
import ConstituentaToolbar from './ConstituentaToolbar';
import FormConstituenta from './FormConstituenta';

// Max height of content for left enditor pane.
const UNFOLDED_HEIGHT = '59.1rem';

// Thershold window width to hide side constituents list.
const SIDELIST_HIDE_THRESHOLD = 1100; // px

interface EditorConstituentaProps {
  isMutable: boolean

  activeID?: number
  activeCst?: IConstituenta | undefined
  isModified: boolean
  setIsModified: Dispatch<SetStateAction<boolean>>

  onOpenEdit: (cstID: number) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onRenameCst: (initial: ICstRenameData) => void
  onEditTerm: () => void
  onDeleteCst: (selected: number[], callback?: (items: number[]) => void) => void
}

function EditorConstituenta({
  isMutable, isModified, setIsModified, activeID, activeCst, onEditTerm,
  onCreateCst, onRenameCst, onOpenEdit, onDeleteCst
}: EditorConstituentaProps) {
  const windowSize = useWindowSize();
  const { schema } = useRSForm();

  const [showList, setShowList] = useLocalStorage('rseditor-show-list', true);
  const [toggleReset, setToggleReset] = useState(false);

  const disabled = useMemo(() => (!activeCst || !isMutable), [activeCst, isMutable]);

  function handleDelete() {
    if (!schema || !activeID) {
      return;
    }
    onDeleteCst([activeID]);
  }

  function handleCreate() {
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

  function handleClone() {
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

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }
    if (event.ctrlKey && event.code === 'KeyS') {
      if (isModified) {
        initiateSubmit();
      }
      event.preventDefault();
      return;
    }
    if (!event.altKey || event.shiftKey) {
      return;
    }
    if (processAltKey(event.code)) {
      event.preventDefault();
      return;
    }
  }

  function initiateSubmit() {
    const element = document.getElementById(globalIDs.constituenta_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function processAltKey(code: string): boolean {
    switch (code) {
      case 'KeyV':   handleClone(); return true;
    }
    return false;
  }

  return (
  <>
    <ConstituentaToolbar
      isMutable={!disabled}
      isModified={isModified}
    
      onSubmit={initiateSubmit}
      onReset={() => setToggleReset(prev => !prev)}
    
      onDelete={handleDelete}
      onClone={handleClone}
      onCreate={handleCreate}
    />
    <div tabIndex={-1}
      className='flex max-w-[95rem]'
      onKeyDown={handleInput}
    >
      <FormConstituenta disabled={disabled}
        showList={showList}
        id={globalIDs.constituenta_editor}
        constituenta={activeCst}
        isModified={isModified}
        toggleReset={toggleReset}
        onToggleList={() => setShowList(prev => !prev)}
        
        setIsModified={setIsModified}
        onEditTerm={onEditTerm}
        onRenameCst={onRenameCst}
      />
      {(showList && windowSize.width && windowSize.width >= SIDELIST_HIDE_THRESHOLD) ?
      <ViewConstituents
        schema={schema}
        expression={activeCst?.definition_formal ?? ''}
        baseHeight={UNFOLDED_HEIGHT}
        activeID={activeID}
        onOpenEdit={onOpenEdit}
      />: null}
    </div>
  </>);
}

export default EditorConstituenta;
