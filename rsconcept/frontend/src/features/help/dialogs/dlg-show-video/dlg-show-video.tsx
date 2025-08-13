'use client';

import { TabList, TabPanel, Tabs } from 'react-tabs';

import { ModalView } from '@/components/modal';
import { TabLabel } from '@/components/tabs';
import { useWindowSize } from '@/hooks/use-window-size';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { type IVideo } from '@/utils/constants';

import { TabVK } from './tab-vk';
import { TabYoutube } from './tab-youtube';

export const TabID = {
  VK: 0,
  YOUTUBE: 1
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export interface DlgShowVideoProps {
  video: IVideo;
}

export function DlgShowVideo() {
  const preferredPlayer = usePreferencesStore(state => state.preferredPlayer);
  const setPreferredPlayer = usePreferencesStore(state => state.setPreferredPlayer);
  const activeTab = preferredPlayer === 'vk' ? TabID.VK : TabID.YOUTUBE;
  const { video } = useDialogsStore(state => state.props as DlgShowVideoProps);
  const windowSize = useWindowSize();

  const videoHeight = (() => {
    const viewH = windowSize.height ?? 0;
    const viewW = windowSize.width ?? 0;
    const availableWidth = viewW - 80;
    return Math.min(Math.max(viewH - 150, 300), Math.floor((availableWidth * 9) / 16));
  })();

  function setActiveTab(newTab: TabID) {
    setPreferredPlayer(newTab === TabID.VK ? 'vk' : 'youtube');
  }

  return (
    <ModalView fullScreen className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]'>
      <Tabs
        className='flex flex-col gap-1 items-center pt-3'
        selectedIndex={activeTab}
        onSelect={index => setActiveTab(index as TabID)}
      >
        <TabList className='mx-auto flex border divide-x rounded-none'>
          <TabLabel label='ВК Видео' className='w-32' />
          <TabLabel label='Youtube' className='w-32' />
        </TabList>

        <TabPanel>
          <TabVK videoHeight={videoHeight} videoID={video.vk} />
        </TabPanel>
        <TabPanel>
          <TabYoutube videoHeight={videoHeight} videoID={video.youtube} />
        </TabPanel>
      </Tabs>
    </ModalView>
  );
}
