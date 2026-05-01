'use client';

import { Suspense, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type RSForm, type Substitution } from '@/domain/library';
import { useTx } from '@/i18n/use-tx';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { formatLabel, lid } from '@/utils/labels';
import { withPreventDefault } from '@/utils/utils';

import { type InlineSynthesisDTO, schemaInlineSynthesis } from '../../backend/types';

import { TabConstituents } from './tab-constituents';
import { TabSource } from './tab-source';
import { TabSubstitutions } from './tab-substitutions';

export interface DlgInlineSynthesisProps {
  receiver: RSForm;
  onSynthesis: (data: InlineSynthesisDTO) => void;
}

const TabID = {
  SCHEMA: 0,
  SELECTIONS: 1,
  SUBSTITUTIONS: 2
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgInlineSynthesis() {
  const tx = useTx();
  const { receiver, onSynthesis } = useDialogsStore(state => state.props as DlgInlineSynthesisProps);
  const [activeTab, setActiveTab] = useState<TabID>(TabID.SCHEMA);

  const defaultValues: InlineSynthesisDTO = {
    receiver: receiver.id,
    source: null,
    items: [],
    substitutions: []
  };
  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaInlineSynthesis
    },
    onSubmit: ({ value }) => onSynthesis(value)
  });

  const values = useStore(form.store, state => state.values);
  const sourceID = values.source;
  const canSubmit = sourceID !== null && schemaInlineSynthesis.safeParse(values).success;

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
      header={tx('ui.dlg.inlineSynthesis.header', 'Import conceptual schema')}
      submitText={tx('ui.action.addConstituents', 'Add constituents')}
      className='w-160 h-132 px-6'
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : formatLabel(lid.hint.sourceEmpty)}
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none'>
          <TabLabel
            label={tx('ui.tab.inlineSynthesis.schema', 'Schema')}
            title={tx('ui.tab.inlineSynthesis.schemaTitle', 'Constituent source')}
          />
          <TabLabel
            label={tx('ui.tab.inlineSynthesis.constituents', 'Constituents')}
            title={
              !sourceID
                ? tx('ui.tab.inlineSynthesis.selectSchemaFirst', 'Select a schema')
                : tx('ui.tab.inlineSynthesis.constituentsTitle', 'Constituent list')
            }
            disabled={!sourceID}
          />
          <TabLabel
            label={tx('ui.tab.inlineSynthesis.substitutions', 'Substitutions')}
            title={
              !sourceID
                ? tx('ui.tab.inlineSynthesis.selectSchemaFirst', 'Select a schema')
                : tx('ui.tab.inlineSynthesis.substitutionsTitle', 'Substitution table')
            }
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
