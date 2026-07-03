'use client';

import { Suspense, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useTx } from '@/i18n';
import { type OssLayout } from '@rsconcept/domain/library';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '@rsconcept/domain/library/oss-layout-api';
import { type Substitution } from '@rsconcept/domain/library/rsform';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';

import { type CreateSynthesisDTO, schemaCreateSynthesis } from '../../backend/types';
import { useCreateSynthesis } from '../../backend/use-create-synthesis';
import { useOss } from '../../backend/use-oss';
import { useOssDialogsStore } from '../oss-dialog-store';

import { TabArguments } from './tab-arguments';
import { TabSubstitutions } from './tab-substitutions';

export interface DlgCreateSynthesisProps {
  ossID: number;
  layout: OssLayout;
  initialParent: number | null;
  initialInputs: number[];
  defaultX: number;
  defaultY: number;
  onCreate?: (newID: number) => void;
}

const TabID = {
  ARGUMENTS: 0,
  SUBSTITUTIONS: 1
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCreateSynthesis() {
  const tx = useTx();
  const { createSynthesis } = useCreateSynthesis();

  const { ossID, layout, initialInputs, initialParent, onCreate, defaultX, defaultY } = useOssDialogsStore(
    state => state.props as DlgCreateSynthesisProps
  );
  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

  const form = useForm({
    defaultValues: {
      item_data: {
        alias: '',
        title: '',
        description: '',
        parent: initialParent
      },
      position: {
        x: defaultX,
        y: defaultY,
        width: OPERATION_NODE_WIDTH,
        height: OPERATION_NODE_HEIGHT
      },
      arguments: initialInputs,
      substitutions: [] as Substitution[],
      layout: manager.layout
    } satisfies CreateSynthesisDTO,
    validators: {
      onChange: schemaCreateSynthesis
    },
    onSubmit: ({ value }) => {
      const data = { ...value };
      data.position = manager.newOperationPosition(data.position, data.item_data.parent, data.arguments);
      data.layout = manager.layout;
      void createSynthesis({ itemID: manager.oss.id, data }).then(response => onCreate?.(response.new_operation));
    }
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.item_data.alias;
  const [activeTab, setActiveTab] = useState<TabID>(TabID.ARGUMENTS);
  const { canSubmit, hint } = (() => {
    if (!alias) {
      return { canSubmit: false, hint: tx('tx.cst.alias.validate') };
    }
    if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: tx('tx.lib.alias.validate.taken') };
    }
    if (!schemaCreateSynthesis.safeParse(values).success) {
      return { canSubmit: false, hint: tx('tx.general.form.invalid') };
    }
    return { canSubmit: true, hint: '' };
  })();

  function TitleField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.title'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function AliasField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.alias'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function ParentField({ children }: CreateFieldProps<number | null>) {
    return <form.Field name='item_data.parent'>{field => children(field as FieldStateData<number | null>)}</form.Field>;
  }

  function DescriptionField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.description'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function ArgumentsField({ children }: CreateFieldProps<number[]>) {
    return <form.Field name='arguments'>{field => children(field as FieldStateData<number[]>)}</form.Field>;
  }

  function SubstitutionsField({ children }: CreateFieldProps<Substitution[]>) {
    return <form.Field name='substitutions'>{field => children(field as FieldStateData<Substitution[]>)}</form.Field>;
  }

  return (
    <ModalForm
      header={tx('tx.synthesis.short')}
      submitText={tx('tx.general.create')}
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-180 px-6 h-128'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='z-pop mx-auto flex border divide-x rounded-none'>
          <TabLabel title={tx('tx.operation.argument.select')} label={tx('tx.operation.argument.plural')} />
          <TabLabel title={tx('tx.substitution.table')} label={tx('tx.substitution.plural')} />
        </TabList>
        <TabPanel>
          <TabArguments
            oss={schema}
            inputs={values.arguments}
            fields={{ TitleField, AliasField, ParentField, DescriptionField, ArgumentsField }}
          />
        </TabPanel>
        <TabPanel>
          <Suspense fallback={<Loader />}>
            <TabSubstitutions
              oss={schema}
              inputs={values.arguments}
              substitutions={values.substitutions}
              fields={{ SubstitutionsField }}
            />
          </Suspense>
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}
