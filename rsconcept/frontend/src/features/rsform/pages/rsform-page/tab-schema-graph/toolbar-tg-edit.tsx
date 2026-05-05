'use client';

import { type Graph } from '@/domain/graph/graph';
import { type LibraryItemReference } from '@/domain/library';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

import { MiniButton } from '@/components/control';
import { IconCrucial, IconDestroy, IconEdit2, IconNewItem, IconTypeGraph } from '@/components/icons';
import { cn } from '@/components/utils';
import { prepareTooltip } from '@/utils/format';

import { useSchemaEdit } from '../schema-edit-context';

import { useHandleActions } from './use-handle-actions';

interface ToolbarTGEditProps {
  className?: string;
  graph: Graph<number>;
}

export function ToolbarTGEdit({ className, graph }: ToolbarTGEditProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { schema, selectedCst, isContentEditable, canDeleteSelected, toggleCrucial, isProcessing } = useSchemaEdit();

  const { handleCreateCst, handleDeleteSelected, handelFastEdit, handleShowTypeGraph } = useHandleActions(graph);

  function handleSelectOss(event: React.MouseEvent<HTMLElement>, newValue: LibraryItemReference) {
    router.gotoOss(newValue.id, event.ctrlKey || event.metaKey);
  }

  return (
    <div className={cn('cc-icons pointer-events-auto', className)}>
      {schema.oss.length > 0 ? <MiniSelectorOSS items={schema.oss} onSelect={handleSelectOss} /> : null}
      <MiniButton
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        title={tx('ui.tg.toolbar.echelonGraphTitle')}
        onClick={handleShowTypeGraph}
      />
      {isContentEditable ? (
        <MiniButton
          title={prepareTooltip(tx('semantic.term.constituenta.crucial'), 'F')}
          aria-label={tx('ui.cst.crucialToggleAria')}
          icon={<IconCrucial size='1.25rem' className='icon-primary' />}
          onClick={toggleCrucial}
          disabled={isProcessing || selectedCst.length === 0}
        />
      ) : null}
      {isContentEditable ? (
        <MiniButton
          title={prepareTooltip(tx('ui.toolbar.deleteSelected'), 'Delete, `')}
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          onClick={handleDeleteSelected}
          disabled={!canDeleteSelected || isProcessing}
        />
      ) : null}
      {isContentEditable ? (
        <MiniButton
          title={prepareTooltip(tx('ui.toolbar.newConstituenta'), 'R')}
          icon={<IconNewItem size='1.25rem' className='icon-green' />}
          onClick={handleCreateCst}
          disabled={isProcessing}
        />
      ) : null}
      {isContentEditable ? (
        <MiniButton
          title={prepareTooltip(tx('ui.toolbar.editConstituenta'), 'Alt + V')}
          icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
          onClick={handelFastEdit}
          disabled={isProcessing || selectedCst.length !== 1}
        />
      ) : null}
    </div>
  );
}
