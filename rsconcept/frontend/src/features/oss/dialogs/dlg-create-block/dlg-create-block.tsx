'use client';

import { useMemo, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type OssLayout } from '@/domain/library';
import { LayoutManager } from '@/domain/library/oss-layout-api';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';
import { hintMsg } from '@/utils/labels';

import { type CreateBlockDTO, schemaCreateBlock } from '../../backend/types';
import { useCreateBlock } from '../../backend/use-create-block';
import { useOss } from '../../backend/use-oss';
import { BLOCK_NODE_MIN_HEIGHT, BLOCK_NODE_MIN_WIDTH } from '../../pages/oss-page/tab-oss-graph/graph/block-node';

import { type DlgCreateBlockCardFields, TabBlockCard } from './tab-block-card';
import { TabBlockChildren } from './tab-block-children';

export interface DlgCreateBlockProps {
  ossID: number;
  layout: OssLayout;
  childrenBlocks: number[];
  childrenOperations: number[];
  initialParent: number | null;
  defaultX: number;
  defaultY: number;
  onCreate?: (newID: number) => void;
}

const TabID = {
  CARD: 0,
  CHILDREN: 1
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCreateBlock() {
  const { createBlock } = useCreateBlock();

  const { ossID, layout, childrenBlocks, childrenOperations, initialParent, onCreate, defaultX, defaultY } =
    useDialogsStore(state => state.props as DlgCreateBlockProps);

  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

  const form = useForm({
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
    } satisfies CreateBlockDTO,
    validators: {
      onChange: schemaCreateBlock
    },
    onSubmit: ({ value }) => {
      const data = { ...value };
      data.position = manager.newBlockPosition(
        data.position,
        data.item_data.parent,
        data.children_blocks,
        data.children_operations
      );
      data.layout = manager.layout;
      void createBlock({ itemID: manager.oss.id, data }).then(response => onCreate?.(response.new_block));
    }
  });

  const values = useStore(form.store, state => state.values);
  const title = values.item_data.title;
  const [activeTab, setActiveTab] = useState<TabID>(TabID.CARD);
  const { canSubmit, hint } = useMemo(() => {
    if (!title) {
      return { canSubmit: false, hint: hintMsg.titleEmpty };
    }
    if (manager.oss.blocks.some(block => block.title === title)) {
      return { canSubmit: false, hint: hintMsg.blockTitleTaken };
    }
    if (!schemaCreateBlock.safeParse(values).success) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    }
    return { canSubmit: true, hint: '' };
  }, [title, values, manager.oss.blocks]);

  function TitleField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.title'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function ParentField({ children }: CreateFieldProps<number | null>) {
    return <form.Field name='item_data.parent'>{field => children(field as FieldStateData<number | null>)}</form.Field>;
  }

  function DescriptionField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.description'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  const cardFields: DlgCreateBlockCardFields = {
    TitleField,
    ParentField,
    DescriptionField
  };

  function handleChildrenBlocksChange(childrenBlocks: number[]) {
    form.setFieldValue('children_blocks', childrenBlocks);
  }

  function handleChildrenOperationsChange(childrenOperations: number[]) {
    form.setFieldValue('children_operations', childrenOperations);
  }

  return (
    <ModalForm
      header='Создание блока'
      submitText='Создать'
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-160 px-6 h-110'
      helpTopic={HelpTopic.CC_STRUCTURING}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='z-pop mx-auto flex border divide-x rounded-none'>
          <TabLabel title='Основные атрибуты блока' label='Паспорт' />
          <TabLabel
            title={`Выбор вложенных узлов: [${childrenOperations.length + childrenBlocks.length}]`}
            label={`Содержимое${childrenOperations.length + childrenBlocks.length > 0 ? '*' : ''}`}
          />
        </TabList>

        <TabPanel>
          <TabBlockCard oss={schema} blocks={values.children_blocks} fields={cardFields} />
        </TabPanel>

        <TabPanel>
          <TabBlockChildren
            oss={schema}
            parent={values.item_data.parent}
            blocks={values.children_blocks}
            operations={values.children_operations}
            onChangeBlocks={handleChildrenBlocksChange}
            onChangeOperations={handleChildrenOperationsChange}
          />
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}
