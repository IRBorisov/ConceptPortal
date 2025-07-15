import { Suspense, useState } from 'react';

import { ComboBox } from '@/components/input/combo-box';
import { Loader } from '@/components/loader';
import { ModalView } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';

import { useAvailableTemplatesSuspense } from '../../backend/use-available-templates';

import { TabPromptResult } from './tab-prompt-result';
import { TabPromptSelect } from './tab-prompt-select';
import { TabPromptVariables } from './tab-prompt-variables';

export const TabID = {
  SELECT: 0,
  RESULT: 1,
  VARIABLES: 2
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgAIPromptDialog() {
  const [activeTab, setActiveTab] = useState<TabID>(TabID.SELECT);
  const [selected, setSelected] = useState<number | null>(null);
  const { items: prompts } = useAvailableTemplatesSuspense();

  return (
    <ModalView header='Генератор запросом LLM' className='w-100 sm:w-160 px-6'>
      <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto w-fit flex border divide-x rounded-none'>
          <TabLabel label='Шаблон' />
          <TabLabel label='Результат' disabled={!selected} />
          <TabLabel label='Переменные' disabled={!selected} />
        </TabList>

        <div className='h-120 flex flex-col gap-2'>
          <ComboBox
            id='prompt-select'
            items={prompts}
            value={prompts?.find(p => p.id === selected) ?? null}
            onChange={item => setSelected(item?.id ?? 0)}
            idFunc={item => String(item.id)}
            labelValueFunc={item => item.label}
            labelOptionFunc={item => item.label}
            placeholder='Выберите шаблон'
            className='w-full'
          />
          <Suspense fallback={<Loader />}>
            <TabPanel>{selected ? <TabPromptSelect promptID={selected} /> : null}</TabPanel>
            <TabPanel>{selected ? <TabPromptResult promptID={selected} /> : null}</TabPanel>
            <TabPanel>{selected ? <TabPromptVariables promptID={selected} /> : null}</TabPanel>
          </Suspense>
        </div>
      </Tabs>
    </ModalView>
  );
}
