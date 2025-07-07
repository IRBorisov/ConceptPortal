import { Suspense } from 'react';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { MiniButton } from '@/components/control';
import { IconClose } from '@/components/icons';
import { Loader } from '@/components/loader';
import { cn } from '@/components/utils';
import { useMainHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';

import { NodeType } from '../../../../models/oss';
import { useOssEdit } from '../../oss-edit-context';

import { BlockStats } from './block-stats';
import { ViewSchema } from './view-schema';

interface SidePanelProps {
  className?: string;
  isMounted: boolean;
}

export function SidePanel({ isMounted, className }: SidePanelProps) {
  const { schema, isMutable, selectedItems } = useOssEdit();
  const selectedOperation =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.OPERATION ? selectedItems[0] : null;
  const selectedBlock =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.BLOCK ? selectedItems[0] : null;
  const selectedSchema = selectedOperation?.result ?? null;

  const debouncedMounted = useDebounce(isMounted, PARAMETER.moveDuration);
  const closePanel = usePreferencesStore(state => state.toggleShowOssSidePanel);
  const sidePanelHeight = useMainHeight();

  return (
    <aside
      className={cn(
        'relative flex flex-col py-2 h-full overflow-hidden',
        'border-l rounded-none rounded-l-sm bg-background',
        className
      )}
      style={{ height: sidePanelHeight }}
    >
      <MiniButton
        titleHtml='Закрыть панель'
        aria-label='Закрыть'
        noPadding
        icon={<IconClose size='1.25rem' />}
        className='absolute z-pop top-2 right-1'
        onClick={closePanel}
      />

      <div
        className={clsx(
          'mt-0 mb-1',
          'font-medium text-sm select-none self-center',
          'transition-transform',
          selectedSchema && 'translate-x-20'
        )}
      >
        Содержание
      </div>

      {!selectedOperation && !selectedBlock ? (
        <div className='text-center text-sm cc-fade-in'>Выделите операцию или блок для просмотра</div>
      ) : null}
      {selectedOperation && !selectedSchema ? (
        <div className='text-center text-sm cc-fade-in'>Отсутствует концептуальная схема для выбранной операции</div>
      ) : selectedOperation && selectedSchema && debouncedMounted ? (
        <Suspense fallback={<Loader />}>
          <ViewSchema schemaID={selectedSchema} isMutable={isMutable && selectedOperation.is_owned} />
        </Suspense>
      ) : null}
      {selectedBlock ? <BlockStats target={selectedBlock} oss={schema} /> : null}
    </aside>
  );
}
