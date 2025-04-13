'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { labelReferenceType } from '../../labels';
import {
  type IReference,
  ReferenceType,
  schemaGrammeme,
  schemaReferenceType,
  supportedGrammemes
} from '../../models/language';
import { parseEntityReference, parseGrammemes, parseSyntacticReference } from '../../models/language-api';
import { type IRSForm } from '../../models/rsform';

import { TabEntityReference } from './tab-entity-reference';
import { TabSyntacticReference } from './tab-syntactic-reference';

export interface IReferenceInputState {
  type: ReferenceType;
  refRaw?: string;
  text?: string;
  mainRefs: string[];
  basePosition: number;
}

const schemaEditReferenceState = z
  .object({
    type: schemaReferenceType,
    entity: z.strictObject({
      entity: z.string(),
      grams: z.array(schemaGrammeme)
    }),
    syntactic: z.strictObject({ offset: z.coerce.number(), nominal: z.string() })
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

const TabID = {
  ENTITY: 0,
  SYNTACTIC: 1
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

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
          form: data.entity.grams.join(',')
        }
      });
    } else {
      onSave({ type: data.type, data: data.syntactic });
    }
  }

  function handleChangeTab(tab: number) {
    methods.setValue('type', tab === TabID.ENTITY ? ReferenceType.ENTITY : ReferenceType.SYNTACTIC);
    setActiveTab(tab as TabID);
  }

  return (
    <ModalForm
      header='Редактирование ссылки'
      submitText='Сохранить ссылку'
      canSubmit={methods.formState.isValid}
      onCancel={onCancel}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-160 px-6 h-128'
      helpTopic={HelpTopic.TERM_CONTROL}
    >
      <Tabs selectedTabClassName='cc-selected' className='grid' selectedIndex={activeTab} onSelect={handleChangeTab}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none bg-prim-200'>
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
    const supported = supportedGrammemes.filter(data => grams.includes(data));
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
