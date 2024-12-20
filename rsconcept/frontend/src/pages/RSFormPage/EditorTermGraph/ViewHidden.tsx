'use client';

import clsx from 'clsx';

import { IconDropArrow, IconDropArrowUp } from '@/components/Icons';
import { CProps } from '@/components/props';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { GraphColoring } from '@/models/miscellaneous';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { APP_COLORS, colorBgGraphNode } from '@/styling/color';
import { globals, PARAMETER, prefixes, storage } from '@/utils/constants';

interface ViewHiddenProps {
  items: ConstituentaID[];
  selected: ConstituentaID[];
  schema?: IRSForm;
  coloringScheme: GraphColoring;

  toggleSelection: (cstID: ConstituentaID) => void;
  setFocus: (cstID: ConstituentaID) => void;
  onEdit: (cstID: ConstituentaID) => void;
}

function ViewHidden({ items, selected, toggleSelection, setFocus, schema, coloringScheme, onEdit }: ViewHiddenProps) {
  const { calculateHeight } = useConceptOptions();
  const windowSize = useWindowSize();
  const localSelected = items.filter(id => selected.includes(id));
  const [isFolded, setIsFolded] = useLocalStorage(storage.rsgraphFoldHidden, false);
  const { setHoverCst } = useConceptOptions();

  function handleClick(cstID: ConstituentaID, event: CProps.EventMouse) {
    if (event.ctrlKey || event.metaKey) {
      setFocus(cstID);
    } else {
      toggleSelection(cstID);
    }
  }

  if (!schema || items.length <= 0) {
    return null;
  }
  return (
    <div className='flex flex-col'>
      <Overlay position='right-[calc(0.7rem-2px)] top-2'>
        <MiniButton
          noPadding
          noHover
          title={!isFolded ? 'Свернуть' : 'Развернуть'}
          icon={!isFolded ? <IconDropArrowUp size='1.25rem' /> : <IconDropArrow size='1.25rem' />}
          onClick={() => setIsFolded(prev => !prev)}
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
        className={clsx(
          'flex flex-wrap justify-center gap-2 py-2 mt-[-0.5rem]',
          'text-sm',
          'clr-input border-x border-b rounded-b-md',
          'cc-scroll-y'
        )}
        style={{
          maxHeight: calculateHeight(windowSize.isSmall ? '10.4rem + 2px' : '12.5rem + 2px'),
          transitionProperty: 'clip-path',
          transitionDuration: `${PARAMETER.fastAnimation}ms`,
          transitionTimingFunction: 'ease-out',
          clipPath: isFolded ? 'inset(10% 0% 90% 0%)' : 'inset(0% 0% 0% 0%)'
        }}
      >
        {items.map(cstID => {
          const cst = schema.cstByID.get(cstID)!;
          const adjustedColoring = coloringScheme === 'none' ? 'status' : coloringScheme;
          const id = `${prefixes.cst_hidden_list}${cst.alias}`;
          return (
            <button
              key={id}
              type='button'
              className='min-w-[3rem] rounded-md text-center select-none'
              style={{
                backgroundColor: colorBgGraphNode(cst, adjustedColoring),
                ...(localSelected.includes(cstID)
                  ? {
                      outlineWidth: '2px',
                      outlineStyle: cst.is_inherited ? 'dashed' : 'solid',
                      outlineColor: APP_COLORS.fgDefault
                    }
                  : {})
              }}
              onClick={event => handleClick(cstID, event)}
              onDoubleClick={() => onEdit(cstID)}
              data-tooltip-id={globals.constituenta_tooltip}
              onMouseEnter={() => setHoverCst(cst)}
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
