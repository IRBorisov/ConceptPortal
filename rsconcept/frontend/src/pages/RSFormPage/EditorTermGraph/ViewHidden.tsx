'use client';

import clsx from 'clsx';

import { IconDropArrow, IconDropArrowUp } from '@/components/Icons';
import { CProps } from '@/components/props';
import { Overlay } from '@/components/ui/Container';
import { MiniButton } from '@/components/ui/Control';
import useWindowSize from '@/hooks/useWindowSize';
import { GraphColoring } from '@/models/miscellaneous';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { useFitHeight } from '@/stores/appLayout';
import { useTermGraphStore } from '@/stores/termGraph';
import { useTooltipsStore } from '@/stores/tooltips';
import { APP_COLORS, colorBgGraphNode } from '@/styling/color';
import { globals, PARAMETER, prefixes } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';

interface ViewHiddenProps {
  schema: IRSForm;
  items: ConstituentaID[];
  selected: ConstituentaID[];
  coloringScheme: GraphColoring;

  toggleSelection: (cstID: ConstituentaID) => void;
  setFocus: (cstID: ConstituentaID) => void;
}

function ViewHidden({ items, selected, toggleSelection, setFocus, schema, coloringScheme }: ViewHiddenProps) {
  const windowSize = useWindowSize();
  const localSelected = items.filter(id => selected.includes(id));

  const { navigateCst } = useRSEdit();
  const isFolded = useTermGraphStore(state => state.foldHidden);
  const toggleFolded = useTermGraphStore(state => state.toggleFoldHidden);
  const setActiveCst = useTooltipsStore(state => state.setActiveCst);
  const hiddenHeight = useFitHeight(windowSize.isSmall ? '10.4rem + 2px' : '12.5rem + 2px');

  function handleClick(cstID: ConstituentaID, event: CProps.EventMouse) {
    if (event.ctrlKey || event.metaKey) {
      setFocus(cstID);
    } else {
      toggleSelection(cstID);
    }
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
            transitionProperty: 'margin, translate',
            transitionDuration: `${PARAMETER.fastAnimation}ms`,
            transitionTimingFunction: 'ease-out',
            marginLeft: isFolded ? '0.75rem' : '0',
            translate: isFolded ? '0' : 'calc(6.5rem - 50%)'
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
          transitionProperty: 'clip-path',
          transitionDuration: `${PARAMETER.fastAnimation}ms`,
          transitionTimingFunction: 'ease-out',
          clipPath: isFolded ? 'inset(10% 0% 90% 0%)' : 'inset(0% 0% 0% 0%)'
        }}
      >
        {items.map(cstID => {
          const cst = schema.cstByID.get(cstID)!;
          const id = `${prefixes.cst_hidden_list}${cst.alias}`;
          return (
            <button
              key={id}
              type='button'
              className='min-w-[3rem] rounded-md text-center select-none'
              style={{
                backgroundColor: colorBgGraphNode(cst, coloringScheme),
                ...(localSelected.includes(cstID)
                  ? {
                      outlineWidth: '2px',
                      outlineStyle: cst.is_inherited ? 'dashed' : 'solid',
                      outlineColor: APP_COLORS.fgDefault
                    }
                  : {})
              }}
              onClick={event => handleClick(cstID, event)}
              onDoubleClick={() => navigateCst(cstID)}
              data-tooltip-id={globals.constituenta_tooltip}
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

export default ViewHidden;
