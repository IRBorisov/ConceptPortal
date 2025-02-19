'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { z } from 'zod';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { labelReferenceType } from '../../labels';
import { IReference, ReferenceType } from '../../models/language';
import {
  parseEntityReference,
  parseGrammemes,
  parseSyntacticReference,
  supportedGrammeOptions
} from '../../models/languageAPI';
import { IRSForm } from '../../models/rsform';

import { TabEntityReference } from './TabEntityReference';
import { TabSyntacticReference } from './TabSyntacticReference';

export interface IReferenceInputState {
  type: ReferenceType;
  refRaw?: string;
  text?: string;
  mainRefs: string[];
  basePosition: number;
}

const schemaEditReferenceState = z
  .object({
    type: z.nativeEnum(ReferenceType),
    entity: z.object({ entity: z.string(), grams: z.array(z.object({ value: z.string(), label: z.string() })) }),
    syntactic: z.object({ offset: z.coerce.number(), nominal: z.string() })
  })
  .refine(
    data =>
      (data.type !== ReferenceType.SYNTACTIC || (data.syntactic.offset !== 0 && data.syntactic.nominal !== '')) &&
      (data.type !== ReferenceType.ENTITY || (data.entity.entity !== '' && data.entity.grams.length > 0))
  );

export type IEditReferenceState = z.infer<typeof schemaEditReferenceState>;

export interface DlgEditReferenceProps {
  schema: IRSForm;
  initial: IReferenceInputState;
  onSave: (newRef: IReference) => void;
  onCancel: () => void;
}

export enum TabID {
  ENTITY = 0,
  SYNTACTIC = 1
}

export function DlgEditReference() {
  const { initial, onSave, onCancel } = useDialogsStore(state => state.props as DlgEditReferenceProps);
  const [activeTab, setActiveTab] = useState(initial.type === ReferenceType.ENTITY ? TabID.ENTITY : TabID.SYNTACTIC);

  const methods = useForm<IEditReferenceState>({
    resolver: zodResolver(schemaEditReferenceState),
    defaultValues: {
      type: initial.type,
      entity: initEntityReference(initial),
      syntactic: initSyntacticReference(initial)
    },
    mode: 'onChange'
  });

  function onSubmit(data: IEditReferenceState) {
    if (data.type === ReferenceType.ENTITY) {
      onSave({
        type: data.type,
        data: {
          entity: data.entity.entity,
          form: data.entity.grams.map(gram => gram.value).join(',')
        }
      });
    } else {
      onSave({ type: data.type, data: data.syntactic });
    }
  }

  function handleChangeTab(tab: TabID) {
    methods.setValue('type', tab === TabID.ENTITY ? ReferenceType.ENTITY : ReferenceType.SYNTACTIC);
    setActiveTab(tab);
  }

  return (
    <ModalForm
      header='Редактирование ссылки'
      submitText='Сохранить ссылку'
      canSubmit={methods.formState.isValid}
      onCancel={onCancel}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-[40rem] px-6 h-[32rem]'
      helpTopic={HelpTopic.TERM_CONTROL}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={handleChangeTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}>
          <TabLabel title='Отсылка на термин в заданной словоформе' label={labelReferenceType(ReferenceType.ENTITY)} />
          <TabLabel
            title='Установление синтаксической связи с отсылкой на термин'
            label={labelReferenceType(ReferenceType.SYNTACTIC)}
          />
        </TabList>

        <FormProvider {...methods}>
          <TabPanel>
            <TabEntityReference />
          </TabPanel>

          <TabPanel>
            <TabSyntacticReference />
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}

// ====== Internals =========
function initEntityReference(initial: IReferenceInputState) {
  if (!initial.refRaw || initial.type === ReferenceType.SYNTACTIC) {
    return {
      entity: '',
      grams: []
    };
  } else {
    const ref = parseEntityReference(initial.refRaw);
    const grams = parseGrammemes(ref.form);
    const supported = supportedGrammeOptions.filter(data => grams.includes(data.value));
    return {
      entity: ref.entity,
      grams: supported
    };
  }
}

function initSyntacticReference(initial: IReferenceInputState) {
  if (!initial.refRaw || initial.type === ReferenceType.ENTITY) {
    return {
      offset: 1,
      nominal: initial.text ?? ''
    };
  } else {
    return parseSyntacticReference(initial.refRaw);
  }
}
