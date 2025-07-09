// Dialog for read-only display of the TermGraph for OSS. Currently ignores activeCst and only shows the schema graph.
import { ReactFlowProvider } from 'reactflow';

import { urls, useConceptNavigation } from '@/app';
// import { useDialogsStore } from '@/stores/dialogs';
import { type IRSForm } from '@/features/rsform';
import { TGFlow } from '@/features/rsform/pages/rsform-page/editor-term-graph/tg-flow';
import { RSTabID } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { MiniButton } from '@/components/control';
import { IconRSForm } from '@/components/icons';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgShowTermGraphProps {
  schema: IRSForm;
}

export function DlgShowTermGraph() {
  const { schema } = useDialogsStore(state => state.props as DlgShowTermGraphProps);
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
    <ModalView
      className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)] cc-mask-sides'
      fullScreen
      header='Граф термов'
    >
      <MiniButton
        title='Открыть концептуальную схему'
        noPadding
        icon={<IconRSForm size='1.25rem' className='text-primary' />}
        onClick={navigateToSchema}
      />
      <ReactFlowProvider>
        {/* TGFlow expects schema from context, so you may need to refactor TGFlow to accept schema as prop if needed */}
        <TGFlow />
      </ReactFlowProvider>
    </ModalView>
  );
}
