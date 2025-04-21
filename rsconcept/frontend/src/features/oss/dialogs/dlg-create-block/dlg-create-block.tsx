'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateBlockDTO, type IOssLayout, schemaCreateBlock } from '../../backend/types';
import { useCreateBlock } from '../../backend/use-create-block';
import { type IOperationSchema } from '../../models/oss';
import { calculateNewBlockPosition } from '../../models/oss-api';
import { BLOCK_NODE_MIN_HEIGHT, BLOCK_NODE_MIN_WIDTH } from '../../pages/oss-page/editor-oss-graph/graph/block-node';

import { TabBlockCard } from './tab-block-card';
import { TabBlockChildren } from './tab-block-children';

export interface DlgCreateBlockProps {
  oss: IOperationSchema;
  layout: IOssLayout;
  initialInputs: number[];
  defaultX: number;
  defaultY: number;
  onCreate?: (newID: number) => void;
}

export const TabID = {
  CARD: 0,
  CHILDREN: 1
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCreateBlock() {
  const { createBlock } = useCreateBlock();

  const { oss, layout, initialInputs, onCreate, defaultX, defaultY } = useDialogsStore(
    state => state.props as DlgCreateBlockProps
  );

  const methods = useForm<ICreateBlockDTO>({
    resolver: zodResolver(schemaCreateBlock),
    defaultValues: {
      item_data: {
        title: '',
        description: '',
        parent: null
      },
      position_x: defaultX,
      position_y: defaultY,
      width: BLOCK_NODE_MIN_WIDTH,
      height: BLOCK_NODE_MIN_HEIGHT,
      children_blocks: initialInputs.filter(id => id < 0).map(id => -id),
      children_operations: initialInputs.filter(id => id > 0),
      layout: layout
    },
    mode: 'onChange'
  });
  const title = useWatch({ control: methods.control, name: 'item_data.title' });
  const [activeTab, setActiveTab] = useState<TabID>(TabID.CARD);
  const isValid = !!title && !oss.blocks.some(block => block.title === title);

  function onSubmit(data: ICreateBlockDTO) {
    const rectangle = calculateNewBlockPosition(data, layout);
    data.position_x = rectangle.x;
    data.position_y = rectangle.y;
    data.width = rectangle.width;
    data.height = rectangle.height;
    void createBlock({ itemID: oss.id, data: data }).then(response => onCreate?.(response.new_block.id));
  }

  return (
    <ModalForm
      header='Создание операции'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-160 px-6 h-128'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Tabs
        selectedTabClassName='cc-selected'
        className='grid'
        selectedIndex={activeTab}
        onSelect={index => setActiveTab(index as TabID)}
      >
        <TabList className='z-pop mx-auto -mb-5 flex border divide-x rounded-none bg-secondary'>
          <TabLabel title='Основные атрибуты блока' label='Карточка' />
          <TabLabel title='Выбор вложенных узлов' label='Содержимое' />
        </TabList>

        <FormProvider {...methods}>
          <TabPanel>
            <TabBlockCard />
          </TabPanel>

          <TabPanel>
            <TabBlockChildren />
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}
