'use client';

import { useTx } from '@/i18n';
import { type RSEngine } from '@rsconcept/domain/library';
import { type TypePath, type Typification, type Value } from '@rsconcept/domain/rslang';

import { HelpTopic } from '@/features/help';

import { ModalView } from '@/components/modal';

import { ValueViewer } from '../components/value-viewer';

import { useRsmodelDialogsStore } from './rsmodel-dialog-store';


export interface DlgViewValueProps {
  value: Value | null;
  type: Typification;
  engine: RSEngine;
  getHeaderText?: (path: TypePath) => string;
}

export function DlgViewValue() {
  const tx = useTx();
  const { value, type, engine, getHeaderText } = useRsmodelDialogsStore(state => state.props as DlgViewValueProps);
  return (
    <ModalView
      helpTopic={HelpTopic.UI_MODEL_VALUE_EDIT}
      noFooterButton
      header={tx('tx.rslang.value.view')}
      className='w-230 h-180 max-w-[calc(100dvw-3rem)] max-h-[calc(100svh-8rem)] px-6 mb-3'
    >
      <ValueViewer rows={20} type={type} value={value} engine={engine} getHeaderText={getHeaderText} />
    </ModalView>
  );
}
