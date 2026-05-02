'use client';

import { type RSEngine } from '@/domain/library';
import { type TypePath, type Typification, type Value } from '@/domain/rslang';
import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';

import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { type RO } from '@/utils/meta';

import { ValueViewer } from '../components/value-viewer';

export interface DlgViewValueProps {
  value: RO<Value | null>;
  type: Typification;
  engine: RSEngine;
  getHeaderText?: (path: TypePath) => string;
}

export function DlgViewValue() {
  const tx = useTx();
  const { value, type, engine, getHeaderText } = useDialogsStore(state => state.props as DlgViewValueProps);
  return (
    <ModalView
      helpTopic={HelpTopic.UI_MODEL_VALUE_EDIT}
      noFooterButton
      header={tx('ui.rsmodel.dlg.viewValue.header')}
      className='w-230 h-180 max-w-[calc(100dvw-3rem)] max-h-[calc(100svh-8rem)] px-6 mb-3'
    >
      <ValueViewer rows={20} type={type} value={value} engine={engine} getHeaderText={getHeaderText} />
    </ModalView>
  );
}
