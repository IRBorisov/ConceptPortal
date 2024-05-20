import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { animateSideAppear } from '@/styling/animations';
import { globals } from '@/utils/constants';

import { IconDropArrow, IconPageRight } from '../Icons';
import { CProps } from '../props';
import MiniButton from './MiniButton';
import Overlay from './Overlay';

interface SelectTreeProps<ItemType> extends CProps.Styling {
  items: ItemType[];
  value: ItemType;
  setValue: (newItem: ItemType) => void;
  getParent: (item: ItemType) => ItemType;
  getLabel: (item: ItemType) => string;
  getDescription: (item: ItemType) => string;
  prefix: string;
}

function SelectTree<ItemType>({
  items,
  value,
  getParent,
  getLabel,
  getDescription,
  setValue,
  prefix,
  ...restProps
}: SelectTreeProps<ItemType>) {
  const foldable = useMemo(
    () => new Set(items.filter(item => getParent(item) !== item).map(item => getParent(item))),
    [items, getParent]
  );
  const [folded, setFolded] = useState<ItemType[]>(items);

  useLayoutEffect(() => {
    setFolded(items.filter(item => getParent(value) !== item && getParent(getParent(value)) !== item));
  }, [value, getParent, items]);

  const onFoldItem = useCallback(
    (target: ItemType, showChildren: boolean) => {
      setFolded(prev =>
        items.filter(item => {
          if (item === target) {
            return !showChildren;
          }
          if (!showChildren && (getParent(item) === target || getParent(getParent(item)) === target)) {
            return true;
          } else {
            return prev.includes(item);
          }
        })
      );
    },
    [items, getParent]
  );

  const handleClickFold = useCallback(
    (event: CProps.EventMouse, target: ItemType, showChildren: boolean) => {
      event.preventDefault();
      event.stopPropagation();
      onFoldItem(target, showChildren);
    },
    [onFoldItem]
  );

  return (
    <div {...restProps}>
      <AnimatePresence initial={false}>
        {items.map((item, index) =>
          getParent(item) === item || !folded.includes(getParent(item)) ? (
            <motion.div
              tabIndex={-1}
              key={`${prefix}${index}`}
              className={clsx(
                'pr-3 pl-6 py-1',
                'cc-scroll-row',
                'clr-controls clr-hover',
                'cursor-pointer',
                value === item && 'clr-selected'
              )}
              data-tooltip-id={globals.tooltip}
              data-tooltip-content={getDescription(item)}
              onClick={() => setValue(item)}
              initial={{ ...animateSideAppear.initial }}
              animate={{ ...animateSideAppear.animate }}
              exit={{ ...animateSideAppear.exit }}
            >
              {foldable.has(item) ? (
                <Overlay position='left-[-1.3rem]' className={clsx(!folded.includes(item) && 'top-[0.1rem]')}>
                  <MiniButton
                    tabIndex={-1}
                    noPadding
                    noHover
                    icon={!folded.includes(item) ? <IconDropArrow size='1rem' /> : <IconPageRight size='1.25rem' />}
                    onClick={event => handleClickFold(event, item, folded.includes(item))}
                  />
                </Overlay>
              ) : null}
              {getParent(item) === item ? getLabel(item) : `- ${getLabel(item).toLowerCase()}`}
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}

export default SelectTree;
