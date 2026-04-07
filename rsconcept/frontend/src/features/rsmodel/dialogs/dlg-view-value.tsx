'use client';

import { HelpTopic } from '@/features/help';
import { type TypePath, type Typification, type Value } from '@/features/rslang';

import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { type RO } from '@/utils/meta';

import { ValueViewer } from '../components/value-viewer';
import { type RSEngine } from '../models/rsengine';

export interface DlgViewValueProps {
  value: RO<Value | null>;
  type: Typification;
  engine: RSEngine;
  getHeaderText?: (path: TypePath) => string;
}

export function DlgViewValue() {
  const { value, type, engine, getHeaderText } = useDialogsStore(state => state.props as DlgViewValueProps);
  return (
    <ModalView
      helpTopic={HelpTopic.UI_RSMODEL_VALUE_DIALOG}
      noFooterButton
      header='Просмотр значения'
      className='w-230 h-180 max-w-[calc(100dvw-3rem)] max-h-[calc(100svh-8rem)] px-6 mb-3'
    >
      <ValueViewer
        rows={20}
        type={type}
        value={value}
        engine={engine}
        getHeaderText={getHeaderText}
      />
    </ModalView>
  );
}
