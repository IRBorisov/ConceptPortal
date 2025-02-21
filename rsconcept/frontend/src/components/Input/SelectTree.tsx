import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { globalIDs, PARAMETER } from '@/utils/constants';

import { Overlay } from '../Container';
import { MiniButton } from '../Control';
import { IconDropArrow, IconPageRight } from '../Icons';
import { type EventMouse, type Styling } from '../props';

interface SelectTreeProps<ItemType> extends Styling {
  /** Current value. */
  value: ItemType;

  /** List of available items. */
  items: ItemType[];

  /** Prefix for the ids of the elements. */
  prefix: string;

  /** Callback to be called when the value changes. */
  onChange: (newItem: ItemType) => void;

  /** Callback providing the parent of the item. */
  getParent: (item: ItemType) => ItemType;

  /** Callback providing the label of the item. */
  getLabel: (item: ItemType) => string;

  /** Callback providing the description of the item. */
  getDescription: (item: ItemType) => string;
}

/**
 * Displays a tree of items and allows user to select one.
 */
export function SelectTree<ItemType>({
  items,
  value,
  getParent,
  getLabel,
  getDescription,
  onChange,
  prefix,
  ...restProps
}: SelectTreeProps<ItemType>) {
  const foldable = new Set(items.filter(item => getParent(item) !== item).map(item => getParent(item)));
  const [folded, setFolded] = useState<ItemType[]>(items);

  useEffect(() => {
    setFolded(items.filter(item => getParent(value) !== item && getParent(getParent(value)) !== item));
  }, [value, getParent, items]);

  function onFoldItem(target: ItemType, showChildren: boolean) {
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
  }

  function handleClickFold(event: EventMouse, target: ItemType, showChildren: boolean) {
    event.preventDefault();
    event.stopPropagation();
    onFoldItem(target, showChildren);
  }

  function handleSetValue(event: EventMouse, target: ItemType) {
    event.preventDefault();
    event.stopPropagation();
    onChange(target);
  }

  return (
    <div tabIndex={-1} {...restProps}>
      {items.map((item, index) => {
        const isActive = getParent(item) === item || !folded.includes(getParent(item));
        return (
          <div
            key={`${prefix}${index}`}
            className={clsx(
              'pr-3 pl-6 border-b',
              'cc-scroll-row',
              'bg-prim-200 clr-hover cc-animate-color',
              'cursor-pointer',
              value === item && 'clr-selected',
              !isActive && 'pointer-events-none'
            )}
            data-tooltip-id={globalIDs.tooltip}
            data-tooltip-html={getDescription(item)}
            onClick={event => handleSetValue(event, item)}
            style={{
              borderBottomWidth: isActive ? '1px' : '0px',
              transitionProperty: 'height, opacity, padding',
              transitionDuration: `${PARAMETER.moveDuration}ms`,
              paddingTop: isActive ? '0.25rem' : '0',
              paddingBottom: isActive ? '0.25rem' : '0',
              height: isActive ? 'min-content' : '0',
              opacity: isActive ? '1' : '0'
            }}
          >
            {foldable.has(item) ? (
              <Overlay position='left-[-1.3rem]' className={clsx(!folded.includes(item) && 'top-[0.1rem]')}>
                <MiniButton
                  noPadding
                  noHover
                  icon={!folded.includes(item) ? <IconDropArrow size='1rem' /> : <IconPageRight size='1.25rem' />}
                  onClick={event => handleClickFold(event, item, folded.includes(item))}
                />
              </Overlay>
            ) : null}
            {getParent(item) === item ? getLabel(item) : `- ${getLabel(item).toLowerCase()}`}
          </div>
        );
      })}
    </div>
  );
}
