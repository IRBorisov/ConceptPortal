'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { IconDropArrow, IconDropArrowUp } from '@/components/Icons';
import ConstituentaTooltip from '@/components/info/ConstituentaTooltip';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/OptionsContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { GraphColoring } from '@/models/miscellaneous';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { animateDropdown, animateHiddenHeader } from '@/styling/animations';
import { colorBgGraphNode } from '@/styling/color';
import { prefixes, storage } from '@/utils/constants';

interface ViewHiddenProps {
  items: ConstituentaID[];
  selected: ConstituentaID[];
  schema?: IRSForm;
  coloringScheme: GraphColoring;

  toggleSelection: (cstID: ConstituentaID) => void;
  onEdit: (cstID: ConstituentaID) => void;
}

function ViewHidden({ items, selected, toggleSelection, schema, coloringScheme, onEdit }: ViewHiddenProps) {
  const { colors, calculateHeight } = useConceptOptions();
  const windowSize = useWindowSize();
  const localSelected = useMemo(() => items.filter(id => selected.includes(id)), [items, selected]);
  const [isFolded, setIsFolded] = useLocalStorage(storage.rsgraphFoldHidden, false);

  if (!schema || items.length <= 0) {
    return null;
  }
  return (
    <div className='flex flex-col'>
      <Overlay position='right-[calc(0.5rem+1px)] top-2'>
        <MiniButton
          noPadding
          noHover
          title={!isFolded ? 'Свернуть' : 'Развернуть'}
          icon={!isFolded ? <IconDropArrowUp size='1.25rem' /> : <IconDropArrow size='1.25rem' />}
          onClick={() => setIsFolded(prev => !prev)}
        />
      </Overlay>
      <div
        className={clsx(
          'pt-2', //
          'border-x',
          'clr-input',
          'select-none',
          {
            'pb-2 border-b': isFolded
          }
        )}
      >
        <motion.div
          className='w-fit'
          animate={!isFolded ? 'open' : 'closed'}
          variants={animateHiddenHeader}
          initial={false}
        >{`Скрытые [${localSelected.length} | ${items.length}]`}</motion.div>
      </div>

      <motion.div
        className={clsx(
          'flex flex-wrap justify-center gap-2 py-2',
          'border-x border-b rounded-b-md',
          'clr-input',
          'text-sm',
          'overflow-y-auto'
        )}
        style={{ maxHeight: calculateHeight(windowSize.isSmall ? '12.rem + 2px' : '16.4rem + 2px') }}
        initial={false}
        animate={!isFolded ? 'open' : 'closed'}
        variants={animateDropdown}
      >
        {items.map(cstID => {
          const cst = schema.cstByID.get(cstID)!;
          const adjustedColoring = coloringScheme === 'none' ? 'status' : coloringScheme;
          const id = `${prefixes.cst_hidden_list}${cst.alias}`;
          return (
            <div key={`wrap-${id}`}>
              <div
                key={id}
                id={id}
                className='min-w-[3rem] rounded-md text-center cursor-pointer select-none'
                style={{
                  backgroundColor: colorBgGraphNode(cst, adjustedColoring, colors),
                  ...(localSelected.includes(cstID) ? { outlineWidth: '2px', outlineStyle: 'solid' } : {})
                }}
                onClick={() => toggleSelection(cstID)}
                onDoubleClick={() => onEdit(cstID)}
              >
                {cst.alias}
              </div>
              <ConstituentaTooltip data={cst} anchor={`#${id}`} />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default ViewHidden;
