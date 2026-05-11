'use client';

import { Suspense, useState } from 'react';

import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';

import { ComboBox } from '@/components/input/combo-box';
import { Loader } from '@/components/loader';
import { ModalView } from '@/components/modal';

import { useAvailableTemplates } from '../../backend/use-available-templates';

import { AIPromptTabs, TabID } from './ai-prompt-tabs';

export function DlgAIPromptDialog() {
  const tx = useTx();
  const [activeTab, setActiveTab] = useState<number>(TabID.TEMPLATE);
  const [selected, setSelected] = useState<number | null>(null);
  const { items: prompts } = useAvailableTemplates();

  return (
    <ModalView
      header={tx('tx.ai.generator')}
      className='w-100 sm:w-160 px-6 flex flex-col h-110'
      helpTopic={HelpTopic.ASSISTANT}
    >
      <ComboBox
        id='prompt-select'
        items={prompts}
        value={prompts?.find(p => p.id === selected) ?? null}
        onChange={item => setSelected(item?.id ?? 0)}
        idFunc={item => String(item.id)}
        labelValueFunc={item => item.label}
        labelOptionFunc={item => item.label}
        placeholder={tx('tx.ai.template.select.hint')}
        className='w-full'
      />
      <Suspense fallback={<Loader />}>
        {selected ? <AIPromptTabs promptID={selected} activeTab={activeTab} setActiveTab={setActiveTab} /> : null}
      </Suspense>
    </ModalView>
  );
}
