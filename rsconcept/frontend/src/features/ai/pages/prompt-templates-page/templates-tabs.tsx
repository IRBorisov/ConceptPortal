import { Suspense } from 'react';

import { useConceptNavigation } from '@/app';
import { type PromptTabID } from '@/app/navigation/navigation-context';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { Loader } from '@/components/loader';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';

import { MenuTemplates } from './menu-templates';
import { TabEditTemplate } from './tab-edit-template';
import { TabListTemplates } from './tab-list-templates';
import { TabViewVariables } from './tab-view-variables';

interface TemplatesTabsProps {
  activeID: number | null;
  tab: PromptTabID;
}

function TabLoader() {
  return (
    <div className='h-20 mt-8 w-full flex items-center'>
      <Loader scale={4} />
    </div>
  );
}

export function TemplatesTabs({ activeID, tab }: TemplatesTabsProps) {
  const router = useConceptNavigation();

  function onSelectTab(index: number, last: number, event: Event) {
    if (last === index) {
      return;
    }
    if (event.type == 'keydown') {
      const kbEvent = event as KeyboardEvent;
      if (kbEvent.altKey) {
        if (kbEvent.code === 'ArrowLeft') {
          router.back();
          return;
        } else if (kbEvent.code === 'ArrowRight') {
          router.forward();
          return;
        }
      }
    }
    router.changeTab(index);
  }

  return (
    <Tabs selectedIndex={tab} onSelect={onSelectTab} className='relative flex flex-col min-w-fit items-center'>
      <TabList className='absolute z-sticky flex border-b-2 border-x-2 divide-x-2 bg-background'>
        <MenuTemplates />
        <TabLabel label='Список' />
        <TabLabel label='Шаблон' />
        <TabLabel label='Переменные' />
        <div className='flex px-1'>
          <BadgeHelp topic={HelpTopic.ASSISTANT} offset={5} />
        </div>
      </TabList>
      <div className='overflow-x-hidden'>
        <TabPanel>
          <Suspense fallback={<TabLoader />}>
            <TabListTemplates activeID={activeID} />
          </Suspense>
        </TabPanel>
        <TabPanel>
          {activeID ? (
            <Suspense fallback={<TabLoader />}>
              {' '}
              <TabEditTemplate activeID={activeID} />{' '}
            </Suspense>
          ) : null}
        </TabPanel>
        <TabPanel>
          <TabViewVariables />
        </TabPanel>
      </div>
    </Tabs>
  );
}
