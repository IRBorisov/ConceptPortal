'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateBlockDTO, schemaCreateBlock } from '../../backend/types';
import { useCreateBlock } from '../../backend/use-create-block';
import { type IOssItem, NodeType } from '../../models/oss';
import { type LayoutManager } from '../../models/oss-layout-api';
import { BLOCK_NODE_MIN_HEIGHT, BLOCK_NODE_MIN_WIDTH } from '../../pages/oss-page/editor-oss-graph/graph/block-node';

import { TabBlockCard } from './tab-block-card';
import { TabBlockChildren } from './tab-block-children';

export interface DlgCreateBlockProps {
  manager: LayoutManager;
  initialChildren: IOssItem[];
  initialParent: number | null;
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

  const { manager, initialChildren, initialParent, onCreate, defaultX, defaultY } = useDialogsStore(
    state => state.props as DlgCreateBlockProps
  );

  const methods = useForm<ICreateBlockDTO>({
    resolver: zodResolver(schemaCreateBlock),
    defaultValues: {
      item_data: {
        title: '',
        description: '',
        parent: initialParent
      },
      position_x: defaultX,
      position_y: defaultY,
      width: BLOCK_NODE_MIN_WIDTH,
      height: BLOCK_NODE_MIN_HEIGHT,
      children_blocks: initialChildren.filter(item => item.nodeType === NodeType.BLOCK).map(item => item.id),
      children_operations: initialChildren.filter(item => item.nodeType === NodeType.OPERATION).map(item => item.id),
      layout: manager.layout
    },
    mode: 'onChange'
  });
  const title = useWatch({ control: methods.control, name: 'item_data.title' });
  const children_blocks = useWatch({ control: methods.control, name: 'children_blocks' });
  const children_operations = useWatch({ control: methods.control, name: 'children_operations' });
  const [activeTab, setActiveTab] = useState<TabID>(TabID.CARD);
  const isValid = !!title && !manager.oss.blocks.some(block => block.title === title);

  function onSubmit(data: ICreateBlockDTO) {
    const rectangle = manager.newBlockPosition(data);
    data.position_x = rectangle.x;
    data.position_y = rectangle.y;
    data.width = rectangle.width;
    data.height = rectangle.height;
    data.layout = manager.layout;
    void createBlock({ itemID: manager.oss.id, data: data }).then(response => onCreate?.(response.new_block.id));
  }

  return (
    <ModalForm
      header='Создание операции'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-160 px-6 h-110'
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
          <TabLabel
            title={`Выбор вложенных узлов: [${children_operations.length + children_blocks.length}]`}
            label={`Содержимое${children_operations.length + children_blocks.length > 0 ? '*' : ''}`}
          />
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
