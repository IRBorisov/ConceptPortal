'use client';

import { Suspense, useMemo, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type InlineSynthesisDTO, schemaInlineSynthesis } from '../../backend/types';
import { useInlineSynthesis } from '../../backend/use-inline-synthesis';
import { useRSForm } from '../../backend/use-rsform';
import { type Substitution } from '../../models/rsform';

import { TabConstituents } from './tab-constituents';
import { TabSource } from './tab-source';
import { TabSubstitutions } from './tab-substitutions';

export interface DlgInlineSynthesisProps {
  receiverID: number;
  onSynthesis: () => void;
}

export const TabID = {
  SCHEMA: 0,
  SELECTIONS: 1,
  SUBSTITUTIONS: 2
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgInlineSynthesis() {
  const { receiverID, onSynthesis } = useDialogsStore(state => state.props as DlgInlineSynthesisProps);
  const [activeTab, setActiveTab] = useState<TabID>(TabID.SCHEMA);
  const { inlineSynthesis } = useInlineSynthesis();
  const { schema: receiver } = useRSForm({ itemID: receiverID });

  const form = useForm({
    defaultValues: {
      receiver: receiver.id,
      source: null,
      items: [],
      substitutions: []
    } as InlineSynthesisDTO,
    validators: {
      onChange: schemaInlineSynthesis
    },
    onSubmit: async ({ value }) => {
      await inlineSynthesis(value).then(onSynthesis);
    }
  });

  const values = useStore(form.store, state => state.values);
  const sourceID = values.source;
  const canSubmit = useMemo(
    () => schemaInlineSynthesis.safeParse(values).success && sourceID !== null,
    [values, sourceID]
  );

  function handleChangeSource(newValue: number) {
    if (newValue === sourceID) {
      return;
    }
    form.setFieldValue('source', newValue);
    form.setFieldValue('items', []);
    form.setFieldValue('substitutions', []);
  }

  function handleChangeItems(newValue: number[]) {
    form.setFieldValue('items', newValue);
  }

  function handleChangeSubstitutions(newValue: Substitution[]) {
    form.setFieldValue('substitutions', newValue);
  }

  return (
    <ModalForm
      header='Импорт концептуальной схем'
      submitText='Добавить конституенты'
      className='w-160 h-132 px-6'
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : hintMsg.sourceEmpty}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none'>
          <TabLabel
            label='Схема' //
            title='Источник конституент'
            className='w-32'
          />
          <TabLabel
            label='Конституенты'
            title={!sourceID ? 'Выберите схему' : 'Перечень конституент'}
            className='w-32'
            disabled={!sourceID}
          />
          <TabLabel
            label='Отождествления'
            title={!sourceID ? 'Выберите схему' : 'Таблица отождествлений'}
            className='w-32'
            disabled={!sourceID}
          />
        </TabList>

        <TabPanel>
          <TabSource receiver={receiver} sourceID={sourceID} onChangeSource={handleChangeSource} />
        </TabPanel>

        <TabPanel>
          {!!sourceID ? (
            <Suspense fallback={<Loader />}>
              <TabConstituents
                sourceID={sourceID}
                selectedItems={values.items}
                substitutions={values.substitutions}
                onChangeItems={handleChangeItems}
                onChangeSubstitutions={handleChangeSubstitutions}
              />
            </Suspense>
          ) : null}
        </TabPanel>

        <TabPanel>
          {!!sourceID ? (
            <Suspense fallback={<Loader />}>
              <TabSubstitutions
                receiver={receiver}
                sourceID={sourceID}
                selected={values.items}
                substitutions={values.substitutions}
                onChangeSubstitutions={handleChangeSubstitutions}
              />
            </Suspense>
          ) : null}
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}
