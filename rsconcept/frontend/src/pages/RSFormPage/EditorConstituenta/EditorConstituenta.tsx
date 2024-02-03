'use client';

import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { CstType, IConstituenta, IRSForm } from '@/models/rsform';
import { globalIDs } from '@/utils/constants';

import ViewConstituents from '../ViewConstituents';
import ConstituentaToolbar from './ConstituentaToolbar';
import FormConstituenta from './FormConstituenta';

// Max height of content for left editor pane.
const UNFOLDED_HEIGHT = '59.1rem';

// Threshold window width to hide side constituents list.
const SIDELIST_HIDE_THRESHOLD = 1100; // px

interface EditorConstituentaProps {
  schema?: IRSForm;
  isMutable: boolean;

  activeCst?: IConstituenta;
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;

  onOpenEdit: (cstID: number) => void;
  onClone: () => void;
  onCreate: (type?: CstType) => void;
  onRename: () => void;
  onEditTerm: () => void;
  onDelete: () => void;
}

function EditorConstituenta({
  schema,
  isMutable,
  isModified,
  setIsModified,
  activeCst,
  onEditTerm,
  onClone,
  onCreate,
  onRename,
  onOpenEdit,
  onDelete
}: EditorConstituentaProps) {
  const windowSize = useWindowSize();

  const [showList, setShowList] = useLocalStorage('rseditor-show-list', true);
  const [toggleReset, setToggleReset] = useState(false);

  const disabled = useMemo(() => !activeCst || !isMutable, [activeCst, isMutable]);

  function handleCreate() {
    onCreate(activeCst?.cst_type);
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
      case 'KeyV':
        onClone();
        return true;
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
        onDelete={onDelete}
        onClone={onClone}
        onCreate={handleCreate}
      />
      <div tabIndex={-1} className='flex max-w-[95rem]' onKeyDown={handleInput}>
        <FormConstituenta
          disabled={disabled}
          showList={showList}
          id={globalIDs.constituenta_editor}
          constituenta={activeCst}
          isModified={isModified}
          toggleReset={toggleReset}
          onToggleList={() => setShowList(prev => !prev)}
          setIsModified={setIsModified}
          onEditTerm={onEditTerm}
          onRename={onRename}
        />
        <AnimatePresence>
          {showList && windowSize.width && windowSize.width >= SIDELIST_HIDE_THRESHOLD ? (
            <ViewConstituents
              schema={schema}
              expression={activeCst?.definition_formal ?? ''}
              baseHeight={UNFOLDED_HEIGHT}
              activeID={activeCst?.id}
              onOpenEdit={onOpenEdit}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}

export default EditorConstituenta;
