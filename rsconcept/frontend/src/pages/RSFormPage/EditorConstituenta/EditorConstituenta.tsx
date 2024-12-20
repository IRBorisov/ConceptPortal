'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { globals, storage } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import ViewConstituents from '../ViewConstituents';
import FormConstituenta from './FormConstituenta';
import ToolbarConstituenta from './ToolbarConstituenta';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1050; // px

interface EditorConstituentaProps {
  activeCst?: IConstituenta;
  isModified: boolean;
  setIsModified: (newValue: boolean) => void;
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function EditorConstituenta({ activeCst, isModified, setIsModified, onOpenEdit }: EditorConstituentaProps) {
  const controller = useRSEdit();
  const windowSize = useWindowSize();
  const { mainHeight } = useConceptOptions();

  const [showList, setShowList] = useLocalStorage(storage.rseditShowList, true);
  const [toggleReset, setToggleReset] = useState(false);

  const disabled = !activeCst || !controller.isContentEditable || controller.isProcessing;
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;

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
      <ToolbarConstituenta
        activeCst={activeCst}
        disabled={disabled}
        modified={isModified}
        showList={showList}
        onSubmit={initiateSubmit}
        onReset={() => setToggleReset(prev => !prev)}
        onToggleList={() => setShowList(prev => !prev)}
      />
      <div
        tabIndex={-1}
        className={clsx(
          'cc-fade-in',
          'min-h-[20rem] max-w-[calc(min(100vw,95rem))] mx-auto',
          'flex pt-[1.9rem]',
          'overflow-y-auto overflow-x-clip',
          { 'flex-col md:items-center': isNarrow }
        )}
        style={{ maxHeight: mainHeight }}
        onKeyDown={handleInput}
      >
        <FormConstituenta
          disabled={disabled}
          id={globals.constituenta_editor}
          state={activeCst}
          isModified={isModified}
          toggleReset={toggleReset}
          setIsModified={setIsModified}
          onEditTerm={controller.editTermForms}
          onRename={controller.renameCst}
          onOpenEdit={onOpenEdit}
        />
        <ViewConstituents
          isMounted={showList}
          schema={controller.schema}
          expression={activeCst?.definition_formal ?? ''}
          isBottom={isNarrow}
          activeCst={activeCst}
          onOpenEdit={onOpenEdit}
        />
      </div>
    </>
  );
}

export default EditorConstituenta;
