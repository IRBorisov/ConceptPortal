'use client';

import { ReactFlowProvider } from 'reactflow';

import { urls, useConceptNavigation } from '@/app';
import { useRSFormSuspense } from '@/features/rsform/backend/use-rsform';
import { RSTabID } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { MiniButton } from '@/components/control';
import { IconRSForm } from '@/components/icons';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { TGReadonlyFlow } from './tg-readonly-flow';

export interface DlgShowTermGraphProps {
  schemaID: number;
}

export function DlgShowTermGraph() {
  const { schemaID } = useDialogsStore(state => state.props as DlgShowTermGraphProps);
  const { schema } = useRSFormSuspense({ itemID: schemaID });
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const router = useConceptNavigation();

  function navigateToSchema() {
    hideDialog();
    router.push({
      path: urls.schema_props({
        id: schema.id,
        tab: RSTabID.GRAPH
      })
    });
  }

  return (
    <ModalView className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]' fullScreen header='Граф термов'>
      <MiniButton
        title='Открыть концептуальную схему'
        noPadding
        className='absolute z-pop top-2 left-2'
        icon={<IconRSForm size='1.25rem' className='text-primary' />}
        onClick={navigateToSchema}
      />
      <ReactFlowProvider>
        <TGReadonlyFlow schema={schema} />
      </ReactFlowProvider>
    </ModalView>
  );
}
