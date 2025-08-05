'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { useAuthSuspense } from '@/features/auth';

import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { usePromptTemplateSuspense } from '../../../backend/use-prompt-template';

import { FormPromptTemplate } from './form-prompt-template';
import { ToolbarTemplate } from './toolbar-template';

interface TabEditTemplateProps {
  activeID: number;
}

export function TabEditTemplate({ activeID }: TabEditTemplateProps) {
  const { promptTemplate } = usePromptTemplateSuspense(activeID);
  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const { user } = useAuthSuspense();
  const isMutable = user.is_staff || promptTemplate.owner === user.id;
  const [toggleReset, setToggleReset] = useState(false);

  function handleReset() {
    setToggleReset(t => !t);
    setIsModified(false);
  }

  function triggerFormSubmit() {
    const form = document.getElementById(globalIDs.prompt_editor) as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
    }
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      if (isModified) {
        triggerFormSubmit();
      }
      event.preventDefault();
      return;
    }
  }

  return (
    <div className='pt-8 rounded bg-background relative' tabIndex={-1} onKeyDown={handleInput}>
      {isMutable ? (
        <ToolbarTemplate
          activeID={activeID}
          className={clsx(
            'cc-tab-tools cc-animate-position',
            'right-1/2 translate-x-0 xs:right-4 xs:-translate-x-1/2 md:right-1/2 md:translate-x-0'
          )}
          onSave={triggerFormSubmit}
          onReset={handleReset}
        />
      ) : null}
      <FormPromptTemplate
        className='mt-8 xs:mt-0 w-100 md:w-180 min-w-70'
        isMutable={isMutable}
        promptTemplate={promptTemplate}
        toggleReset={toggleReset}
      />
    </div>
  );
}
