'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { IconDropArrow, IconDropArrowUp } from '@/components/icons';
import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { globalIDs, prefixes } from '@/utils/constants';

import { colorBgGraphNode } from '../../../colors';
import { type IConstituenta } from '../../../models/rsform';
import { useCstTooltipStore } from '../../../stores/cst-tooltip';
import { useTermGraphStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

interface ViewHiddenProps {
  items: number[];
}

export function ViewHidden({ items }: ViewHiddenProps) {
  const { isSmall } = useWindowSize();
  const coloring = useTermGraphStore(state => state.coloring);
  const { navigateCst, setFocus, schema, selected, toggleSelect } = useRSEdit();

  const localSelected = items.filter(id => selected.includes(id));
  const isFolded = useTermGraphStore(state => state.foldHidden);
  const toggleFolded = useTermGraphStore(state => state.toggleFoldHidden);
  const setActiveCst = useCstTooltipStore(state => state.setActiveCst);
  const hiddenHeight = useFitHeight(isSmall ? '10.4rem + 2px' : '12.5rem + 2px');

  function handleClick(event: React.MouseEvent<Element>, cstID: number) {
    event.preventDefault();
    event.stopPropagation();
    toggleSelect(cstID);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLElement>, target: IConstituenta) {
    event.stopPropagation();
    event.preventDefault();
    setFocus(target);
  }

  if (items.length <= 0) {
    return null;
  }
  return (
    <div className='grid relative'>
      <MiniButton
        className='absolute right-[calc(1rem-4px)] top-3 pointer-events-auto'
        noPadding
        noHover
        title={!isFolded ? 'Свернуть' : 'Развернуть'}
        icon={!isFolded ? <IconDropArrowUp size='1rem' /> : <IconDropArrow size='1rem' />}
        onClick={toggleFolded}
      />

      <div className={clsx('py-2 bg-input border-x', isFolded && 'border-b rounded-b-md')}>
        <div className={clsx('w-fit select-none cc-view-hidden-header', !isFolded && 'open')}>
          {`Скрытые [${localSelected.length} | ${items.length}]`}
        </div>
      </div>

      <div
        tabIndex={-1}
        className={clsx(
          'cc-view-hidden-list flex flex-wrap gap-2 justify-center py-2 -mt-2',
          'border-x border-b rounded-b-md bg-popover',
          'text-sm',
          'cc-scroll-y',
          !isFolded && 'open'
        )}
        aria-hidden={isFolded}
        style={{ maxHeight: hiddenHeight }}
      >
        {items.map(cstID => {
          const cst = schema.cstByID.get(cstID)!;
          return (
            <button
              key={`${prefixes.cst_hidden_list}${cst.alias}`}
              type='button'
              className={clsx(
                'cc-view-hidden-item w-12 rounded-md text-center select-none',
                localSelected.includes(cstID) && 'selected',
                cst.is_inherited && 'inherited'
              )}
              style={{ backgroundColor: colorBgGraphNode(cst, coloring) }}
              onClick={event => handleClick(event, cstID)}
              onContextMenu={event => handleContextMenu(event, cst)}
              onDoubleClick={() => navigateCst(cstID)}
              data-tooltip-id={globalIDs.constituenta_tooltip}
              onMouseEnter={() => setActiveCst(cst)}
            >
              {cst.alias}
            </button>
          );
        })}
      </div>
    </div>
  );
}
