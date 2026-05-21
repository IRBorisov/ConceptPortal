'use client';

import { Suspense, useEffect, useEffectEvent } from 'react';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { NodeType, OperationType } from '@/domain/library';
import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { IconClose } from '@/components/icons';
import { Loader } from '@/components/loader';
import { cn } from '@/components/utils';
import { useAppLayoutStore, useMainHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';

import { useOssEdit } from '../../oss-edit-context';

import { ViewSchema } from './view-schema';

interface SidePanelProps {
  className?: string;
  isMounted: boolean;
}

export function SidePanel({ isMounted, className }: SidePanelProps) {
  const tx = useTx();
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const setToastBottom = useAppLayoutStore(state => state.setToastBottom);
  const onSetToastBottom = useEffectEvent(setToastBottom);
  const { isMutable, selectedItems } = useOssEdit();
  const selectedOperation =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.OPERATION ? selectedItems[0] : null;
  const selectedSchema = selectedOperation?.result ?? null;

  const [debouncedMounted] = useDebounce(isMounted, PARAMETER.moveDuration);
  const closePanel = usePreferencesStore(state => state.toggleShowOssSidePanel);
  const showPanel = usePreferencesStore(state => state.showOssSidePanel);
  const sidePanelHeight = useMainHeight();

  useEffect(
    function setToastPositionForSidePanel() {
      onSetToastBottom(showPanel);
      return () => onSetToastBottom(false);
    },
    [showPanel]
  );

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
        title={tx('tx.general.close')}
        noPadding
        icon={<IconClose size='1.25rem' />}
        className={clsx(
          'absolute z-pop transition-transform duration-move right-0 top-0',
          noNavigationAnimation ? '-translate-x-4 translate-y-0' : 'translate-x-0 translate-y-1'
        )}
        onClick={closePanel}
      />

      {!selectedSchema ? (
        <h2
          className={clsx(
            'mt-0 mb-1',
            'font-medium text-sm select-none self-center',
            selectedSchema && 'translate-x-20'
          )}
        >
          {tx('tx.lib.contents')}
        </h2>
      ) : null}

      {!selectedOperation ? (
        <div className='text-center text-sm cc-fade-in'>{tx('tx.oss.sidebar.empty.hint')}</div>
      ) : null}
      {selectedOperation && !selectedSchema ? (
        <div className='text-center text-sm cc-fade-in'>{tx('tx.operation.attachment.none')}</div>
      ) : selectedOperation && selectedSchema && debouncedMounted ? (
        <Suspense fallback={<Loader />}>
          <ViewSchema
            schemaID={selectedSchema}
            isMutable={
              isMutable && (selectedOperation.operation_type !== OperationType.INPUT || !selectedOperation.is_import)
            }
          />
        </Suspense>
      ) : null}
    </aside>
  );
}
