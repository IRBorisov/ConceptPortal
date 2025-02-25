'use client';

import clsx from 'clsx';

import { Overlay } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import { IconDropArrow, IconDropArrowUp } from '@/components/Icons';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useFitHeight } from '@/stores/appLayout';
import { useTooltipsStore } from '@/stores/tooltips';
import { APP_COLORS } from '@/styling/colors';
import { globalIDs, PARAMETER, prefixes } from '@/utils/constants';

import { colorBgGraphNode } from '../../../colors';
import { type IConstituenta } from '../../../models/rsform';
import { useTermGraphStore } from '../../../stores/termGraph';
import { useRSEdit } from '../RSEditContext';

interface ViewHiddenProps {
  items: number[];
}

export function ViewHidden({ items }: ViewHiddenProps) {
  const windowSize = useWindowSize();
  const coloring = useTermGraphStore(state => state.coloring);
  const { navigateCst, setFocus, schema, selected, toggleSelect } = useRSEdit();

  const localSelected = items.filter(id => selected.includes(id));
  const isFolded = useTermGraphStore(state => state.foldHidden);
  const toggleFolded = useTermGraphStore(state => state.toggleFoldHidden);
  const setActiveCst = useTooltipsStore(state => state.setActiveCst);
  const hiddenHeight = useFitHeight(windowSize.isSmall ? '10.4rem + 2px' : '12.5rem + 2px');

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
    <div className='flex flex-col'>
      <Overlay position='right-[calc(0.7rem-2px)] top-2 pointer-events-auto'>
        <MiniButton
          noPadding
          noHover
          title={!isFolded ? 'Свернуть' : 'Развернуть'}
          icon={!isFolded ? <IconDropArrowUp size='1.25rem' /> : <IconDropArrow size='1.25rem' />}
          onClick={toggleFolded}
        />
      </Overlay>
      <div className={clsx('pt-2 clr-input border-x pb-2', { 'border-b rounded-b-md': isFolded })}>
        <div
          className='w-fit select-none'
          style={{
            transitionProperty: 'translate',
            transitionDuration: `${PARAMETER.fastAnimation}ms`,
            transitionTimingFunction: 'ease-out',
            translate: isFolded ? '0.75rem' : 'calc(6.5rem - 50%)'
          }}
        >
          {`Скрытые [${localSelected.length} | ${items.length}]`}
        </div>
      </div>

      <div
        tabIndex={-1}
        className={clsx(
          'flex flex-wrap justify-center gap-2 py-2 mt-[-0.5rem]',
          'text-sm',
          'clr-input border-x border-b rounded-b-md',
          'cc-scroll-y'
        )}
        style={{
          pointerEvents: isFolded ? 'none' : 'auto',
          maxHeight: hiddenHeight,
          willChange: 'clip-path',
          transitionProperty: 'clip-path',
          transitionDuration: `${PARAMETER.fastAnimation}ms`,
          transitionTimingFunction: 'ease-out',
          clipPath: isFolded ? 'inset(10% 0% 90% 0%)' : 'inset(0% 0% 0% 0%)'
        }}
      >
        {items.map(cstID => {
          const cst = schema.cstByID.get(cstID)!;
          return (
            <button
              key={`${prefixes.cst_hidden_list}${cst.alias}`}
              type='button'
              className='min-w-[3rem] rounded-md text-center select-none'
              style={{
                backgroundColor: colorBgGraphNode(cst, coloring),
                ...(localSelected.includes(cstID)
                  ? {
                      outlineWidth: '2px',
                      outlineStyle: cst.is_inherited ? 'dashed' : 'solid',
                      outlineColor: APP_COLORS.fgDefault
                    }
                  : {})
              }}
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
