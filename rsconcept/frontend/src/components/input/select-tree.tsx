import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { MiniButton } from '../control';
import { IconDropArrow, IconPageRight } from '../icons';
import { type Styling } from '../props';

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

  function onFoldItem(target: ItemType) {
    setFolded(prev =>
      items.filter(item => {
        if (item === target) {
          return !prev.includes(target);
        }
        if (!prev.includes(target) && (getParent(item) === target || getParent(getParent(item)) === target)) {
          return true;
        } else {
          return prev.includes(item);
        }
      })
    );
  }

  function handleClickFold(event: React.MouseEvent<Element>, target: ItemType) {
    event.preventDefault();
    event.stopPropagation();
    onFoldItem(target);
  }

  function handleClickItem(event: React.MouseEvent<Element>, target: ItemType) {
    event.preventDefault();
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      onFoldItem(target);
    } else {
      onChange(target);
    }
  }

  return (
    <div tabIndex={-1} {...restProps}>
      {items.map((item, index) => {
        const isActive = getParent(item) === item || !folded.includes(getParent(item));
        return (
          <div
            key={`${prefix}${index}`}
            className={clsx(
              'cc-tree-item relative cc-scroll-row cc-hover',
              isActive ? 'max-h-7 py-1 border-b' : 'max-h-0 opacity-0 pointer-events-none',
              value === item && 'cc-selected'
            )}
            data-tooltip-id={globalIDs.tooltip}
            data-tooltip-html={getDescription(item)}
            onClick={event => handleClickItem(event, item)}
          >
            {foldable.has(item) ? (
              <MiniButton
                aria-label={!folded.includes(item) ? 'Свернуть' : 'Развернуть'}
                className={clsx('absolute left-1', !folded.includes(item) ? 'top-1.5' : 'top-1')}
                noPadding
                noHover
                icon={!folded.includes(item) ? <IconDropArrow size='1rem' /> : <IconPageRight size='1.25rem' />}
                onClick={event => handleClickFold(event, item)}
              />
            ) : null}
            {getParent(item) === item ? getLabel(item) : `- ${getLabel(item).toLowerCase()}`}
          </div>
        );
      })}
    </div>
  );
}
