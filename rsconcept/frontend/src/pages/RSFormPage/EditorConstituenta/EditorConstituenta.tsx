'use client';

import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { IConstituenta } from '@/models/rsform';
import { globalIDs } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import ViewConstituents from '../ViewConstituents';
import ConstituentaToolbar from './ConstituentaToolbar';
import FormConstituenta from './FormConstituenta';

// Max height of content for left editor pane.
const UNFOLDED_HEIGHT = '59.1rem';

// Threshold window width to hide side constituents list.
const SIDELIST_HIDE_THRESHOLD = 1100; // px

interface EditorConstituentaProps {
  activeCst?: IConstituenta;
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenEdit: (cstID: number) => void;
}

function EditorConstituenta({ activeCst, isModified, setIsModified, onOpenEdit }: EditorConstituentaProps) {
  const controller = useRSEdit();
  const windowSize = useWindowSize();

  const [showList, setShowList] = useLocalStorage('rseditor-show-list', true);
  const [toggleReset, setToggleReset] = useState(false);

  const disabled = useMemo(() => !activeCst || !controller.isMutable, [activeCst, controller.isMutable]);

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
        controller.cloneCst();
        return true;
    }
    return false;
  }

  return (
    <>
      <ConstituentaToolbar
        isMutable={!disabled}
        isModified={isModified}
        onMoveUp={controller.moveUp}
        onMoveDown={controller.moveDown}
        onSubmit={initiateSubmit}
        onReset={() => setToggleReset(prev => !prev)}
        onDelete={controller.deleteCst}
        onClone={controller.cloneCst}
        onCreate={() => controller.createCst(activeCst?.cst_type, false)}
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
          onEditTerm={controller.editTermForms}
          onRename={controller.renameCst}
        />
        <AnimatePresence>
          {showList && windowSize.width && windowSize.width >= SIDELIST_HIDE_THRESHOLD ? (
            <ViewConstituents
              schema={controller.schema}
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
