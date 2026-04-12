'use client';

import { useConceptNavigation } from '@/app';
import { type LibraryItemReference } from '@/features/library';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

import { MiniButton } from '@/components/control';
import { IconCrucial, IconDestroy, IconEdit2, IconNewItem, IconTypeGraph } from '@/components/icons';
import { cn } from '@/components/utils';
import { type Graph } from '@/domain/graph/graph';
import { prepareTooltip } from '@/utils/format';

import { useRSFormEdit } from '../rsedit-context';

import { useHandleActions } from './use-handle-actions';

interface ToolbarTGEditProps {
  className?: string;
  graph: Graph<number>;
}

export function ToolbarTGEdit({ className, graph }: ToolbarTGEditProps) {
  const router = useConceptNavigation();
  const { schema, selectedCst, isContentEditable, canDeleteSelected, toggleCrucial, isProcessing } = useRSFormEdit();

  const { handleCreateCst, handleDeleteSelected, handelFastEdit, handleShowTypeGraph } = useHandleActions(graph);

  function handleSelectOss(event: React.MouseEvent<HTMLElement>, newValue: LibraryItemReference) {
    router.gotoOss(newValue.id, event.ctrlKey || event.metaKey);
  }

  return (
    <div className={cn('cc-icons pointer-events-auto', className)}>
      {schema.oss.length > 0 ? <MiniSelectorOSS items={schema.oss} onSelect={handleSelectOss} /> : null}
      <MiniButton
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        title='Граф ступеней выделенных конституент'
        onClick={handleShowTypeGraph}
      />
      {isContentEditable ? (
        <MiniButton
          titleHtml={prepareTooltip('Ключевая конституента', 'F')}
          aria-label='Переключатель статуса ключевой конституенты'
          icon={<IconCrucial size='1.25rem' className='icon-primary' />}
          onClick={toggleCrucial}
          disabled={isProcessing || selectedCst.length === 0}
        />
      ) : null}
      {isContentEditable ? (
        <MiniButton
          titleHtml={prepareTooltip('Удалить выбранные', 'Delete, `')}
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          onClick={handleDeleteSelected}
          disabled={!canDeleteSelected || isProcessing}
        />
      ) : null}
      {isContentEditable ? (
        <MiniButton
          titleHtml={prepareTooltip('Новая конституента', 'R')}
          icon={<IconNewItem size='1.25rem' className='icon-green' />}
          onClick={handleCreateCst}
          disabled={isProcessing}
        />
      ) : null}
      {isContentEditable ? (
        <MiniButton
          titleHtml={prepareTooltip('Редактировать конституенту', 'V')}
          icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
          onClick={handelFastEdit}
          disabled={isProcessing || selectedCst.length !== 1}
        />
      ) : null}
    </div>
  );
}
