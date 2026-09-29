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
      <div className='flex flex-col py-2 mx-auto w-full min-w-0 max-w-5xl'>
        <h1 className='mb-2 select-none'>{tx('tx.general.user.profile')}</h1>
        <Tabs className='grid min-w-0 grid-cols-1' defaultIndex={0}>
          <TabList className='mb-3 mx-auto w-fit flex border divide-x rounded-none'>
            <TabLabel label={tx('tx.agents.tab.account')} />
            <TabLabel label={tx('tx.agents.tab.keys')} />
            <TabLabel label={tx('tx.agents.tab.activity')} />
          </TabList>

          <TabPanel className='min-w-0'>
            <div className='flex py-2 flex-wrap justify-center'>
              <EditorProfile />
              <EditorPassword />
            </div>
          </TabPanel>

          <TabPanel className='min-w-0'>
            <Suspense fallback={<Loader />}>
              <TabApiKeys />
            </Suspense>
          </TabPanel>

          <TabPanel className='min-w-0'>
            <Suspense fallback={<Loader />}>
              <TabAgentActivity />
            </Suspense>
          </TabPanel>
        </Tabs>
      </div>
    </RequireAuth>
  );
}
