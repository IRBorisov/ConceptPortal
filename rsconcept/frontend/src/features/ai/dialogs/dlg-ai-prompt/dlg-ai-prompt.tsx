'use client';

import { Suspense, useState } from 'react';

import { useTx } from '@/i18n';

import { urls,useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';

import { TextURL } from '@/components/control';
import { ComboBox } from '@/components/input/combo-box';
import { Loader } from '@/components/loader';
import { ModalView } from '@/components/modal';
import { NoData } from '@/components/view';

import { useAvailableTemplates } from '../../backend/use-available-templates';
import { useAiDialogsStore } from '../ai-dialog-store';

import { AIPromptTabs, TabID } from './ai-prompt-tabs';

export function DlgAIPromptDialog() {
  const tx = useTx();
  const router = useConceptNavigation();
  const hideDialog = useAiDialogsStore(state => state.hideDialog);
  const showCreatePromptTemplate = useAiDialogsStore(state => state.showCreatePromptTemplate);
  const [activeTab, setActiveTab] = useState<number>(TabID.TEMPLATE);
  const [selected, setSelected] = useState<number | null>(null);
  const { items: prompts } = useAvailableTemplates();
  const hasTemplates = prompts.length > 0;

  function navigateTemplates() {
    hideDialog();
    router.push({ path: urls.prompt_templates });
  }

  function handleCreateTemplate() {
    showCreatePromptTemplate({});
  }

  return (
    <ModalView
      header={tx('tx.ai.generator')}
      className='w-100 sm:w-160 px-6 flex flex-col h-110'
      helpTopic={HelpTopic.ASSISTANT}
    >
      {hasTemplates ? (
        <ComboBox
          id='prompt-select'
          items={prompts}
          value={prompts.find(p => p.id === selected) ?? null}
          onChange={item => setSelected(item?.id ?? 0)}
          idFunc={item => String(item.id)}
          labelValueFunc={item => item.label}
          labelOptionFunc={item => item.label}
          placeholder={tx('tx.ai.template.select.hint')}
          className='w-full'
        />
      ) : null}
      {hasTemplates && selected ? (
        <Suspense fallback={<Loader />}>
          <AIPromptTabs promptID={selected} activeTab={activeTab} setActiveTab={setActiveTab} />
        </Suspense>
      ) : (
        <NoData className='min-h-80 flex-1 justify-center'>
          {hasTemplates ? (
            <p>{tx('tx.ai.template.select.guidance')}</p>
          ) : (
            <>
              <p>{tx('tx.ai.template.empty.generator')}</p>
              <p className='flex gap-6'>
                <TextURL text={tx('tx.ai.template.create')} onClick={handleCreateTemplate} />
                <TextURL text={tx('tx.ai.template.plural')} onClick={navigateTemplates} />
              </p>
            </>
          )}
        </NoData>
      )}
    </ModalView>
  );
}
