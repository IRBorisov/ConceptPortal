'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type ICreateBlockDTO, type IOssLayout, schemaCreateBlock } from '../../backend/types';
import { useCreateBlock } from '../../backend/use-create-block';
import { useOssSuspense } from '../../backend/use-oss';
import { LayoutManager } from '../../models/oss-layout-api';
import { BLOCK_NODE_MIN_HEIGHT, BLOCK_NODE_MIN_WIDTH } from '../../pages/oss-page/editor-oss-graph/graph/block-node';

import { TabBlockCard } from './tab-block-card';
import { TabBlockChildren } from './tab-block-children';

export interface DlgCreateBlockProps {
  ossID: number;
  layout: IOssLayout;
  childrenBlocks: number[];
  childrenOperations: number[];
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

  const {
    ossID, //
    layout,
    childrenBlocks,
    childrenOperations,
    initialParent,
    onCreate,
    defaultX,
    defaultY
  } = useDialogsStore(state => state.props as DlgCreateBlockProps);

  const { schema } = useOssSuspense({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

  const methods = useForm<ICreateBlockDTO>({
    resolver: zodResolver(schemaCreateBlock),
    defaultValues: {
      item_data: {
        title: '',
        description: '',
        parent: initialParent
      },
      position: {
        x: defaultX,
        y: defaultY,
        width: BLOCK_NODE_MIN_WIDTH,
        height: BLOCK_NODE_MIN_HEIGHT
      },
      children_blocks: childrenBlocks,
      children_operations: childrenOperations,
      layout: manager.layout
    },
    mode: 'onChange'
  });
  const title = useWatch({ control: methods.control, name: 'item_data.title' });
  const children_blocks = useWatch({ control: methods.control, name: 'children_blocks' });
  const children_operations = useWatch({ control: methods.control, name: 'children_operations' });
  const [activeTab, setActiveTab] = useState<TabID>(TabID.CARD);
  const { canSubmit, hint } = (() => {
    if (!title) {
      return { canSubmit: false, hint: hintMsg.titleEmpty };
    } else if (manager.oss.blocks.some(block => block.title === title)) {
      return { canSubmit: false, hint: hintMsg.blockTitleTaken };
    } else if (!methods.formState.isValid) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    } else {
      return { canSubmit: true, hint: '' };
    }
  })();

  function onSubmit(data: ICreateBlockDTO) {
    data.position = manager.newBlockPosition(data);
    data.layout = manager.layout;
    void createBlock({ itemID: manager.oss.id, data: data }).then(response => onCreate?.(response.new_block));
  }

  return (
    <ModalForm
      header='Создание блока'
      submitText='Создать'
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-160 px-6 h-110'
      helpTopic={HelpTopic.CC_STRUCTURING}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='z-pop mx-auto -mb-5 flex border divide-x rounded-none'>
          <TabLabel title='Основные атрибуты блока' label='Паспорт' />
          <TabLabel
            title={`Выбор вложенных узлов: [${children_operations.length + children_blocks.length}]`}
            label={`Содержимое${children_operations.length + children_blocks.length > 0 ? '*' : ''}`}
          />
        </TabList>

        <FormProvider {...methods}>
          <TabPanel>
            <TabBlockCard oss={schema} />
          </TabPanel>

          <TabPanel>
            <TabBlockChildren oss={schema} />
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}
