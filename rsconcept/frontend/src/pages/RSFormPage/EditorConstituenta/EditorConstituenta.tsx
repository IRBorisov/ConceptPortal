'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { globals, storage } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import ViewConstituents from '../ViewConstituents';
import ConstituentaToolbar from './ConstituentaToolbar';
import FormConstituenta from './FormConstituenta';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1100; // px

interface EditorConstituentaProps {
  activeCst?: IConstituenta;
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function EditorConstituenta({ activeCst, isModified, setIsModified, onOpenEdit }: EditorConstituentaProps) {
  const controller = useRSEdit();
  const windowSize = useWindowSize();

  const [showList, setShowList] = useLocalStorage(storage.rseditShowList, true);
  const [toggleReset, setToggleReset] = useState(false);

  const disabled = useMemo(
    () => !activeCst || !controller.isContentEditable || controller.isProcessing,
    [activeCst, controller.isContentEditable, controller.isProcessing]
  );

  const isNarrow = useMemo(() => !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD, [windowSize]);

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
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
    const element = document.getElementById(globals.constituenta_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function processAltKey(code: string): boolean {
    // prettier-ignore
    switch (code) {
      case 'ArrowUp': controller.moveUp(); return true;
      case 'ArrowDown': controller.moveDown(); return true;
      case 'KeyV': controller.cloneCst(); return true;
    }
    return false;
  }

  return (
    <>
      {controller.isContentEditable ? (
        <ConstituentaToolbar
          disabled={disabled}
          modified={isModified}
          onMoveUp={controller.moveUp}
          onMoveDown={controller.moveDown}
          onSubmit={initiateSubmit}
          onReset={() => setToggleReset(prev => !prev)}
          onDelete={controller.deleteCst}
          onClone={controller.cloneCst}
          onCreate={() => controller.createCst(activeCst?.cst_type, false)}
        />
      ) : null}
      <div
        tabIndex={-1}
        className={clsx(
          'max-w-[95rem]', // prettier: split lines
          'flex',
          { 'flex-col md:items-center': isNarrow }
        )}
        onKeyDown={handleInput}
      >
        <FormConstituenta
          disabled={disabled}
          showList={showList}
          id={globals.constituenta_editor}
          state={activeCst}
          isModified={isModified}
          toggleReset={toggleReset}
          onToggleList={() => setShowList(prev => !prev)}
          setIsModified={setIsModified}
          onEditTerm={controller.editTermForms}
          onRename={controller.renameCst}
        />
        <AnimatePresence>
          {showList ? (
            <ViewConstituents
              schema={controller.schema}
              expression={activeCst?.definition_formal ?? ''}
              isBottom={isNarrow}
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
