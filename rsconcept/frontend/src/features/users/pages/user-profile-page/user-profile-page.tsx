'use client';

import { Suspense } from 'react';

import { useTx } from '@/i18n';

import { RequireAuth } from '@/features/auth/components/require-auth';

import { Loader } from '@/components/loader';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';

import { EditorPassword } from './editor-password';
import { EditorProfile } from './editor-profile';
import { TabAgentActivity } from './tab-agent-activity';
import { TabApiKeys } from './tab-api-keys';

export function UserProfilePage() {
  const tx = useTx();
  return (
    <RequireAuth>
      <div className='flex flex-col py-2 mx-auto w-fit min-w-0 max-w-5xl'>
        <h1 className='mb-2 select-none'>{tx('tx.general.user.profile')}</h1>
        <Tabs className='flex flex-col' defaultIndex={0}>
          <TabList className='mb-3 flex border divide-x rounded-none w-fit'>
            <TabLabel label={tx('tx.agents.tab.account')} />
            <TabLabel label={tx('tx.agents.tab.keys')} />
            <TabLabel label={tx('tx.agents.tab.activity')} />
          </TabList>

          <TabPanel>
            <div className='flex py-2 flex-wrap'>
              <EditorProfile />
              <EditorPassword />
            </div>
          </TabPanel>

          <TabPanel>
            <Suspense fallback={<Loader />}>
              <TabApiKeys />
            </Suspense>
          </TabPanel>

          <TabPanel>
            <Suspense fallback={<Loader />}>
              <TabAgentActivity />
            </Suspense>
          </TabPanel>
        </Tabs>
      </div>
    </RequireAuth>
  );
}
