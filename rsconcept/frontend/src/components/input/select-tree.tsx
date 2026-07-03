'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { useTx } from '@/i18n';

import { MiniButton } from '../control';
import { IconDropArrow, IconPageRight } from '../icons';
import { type Styling } from '../props';

import { SelectTreeItem } from './select-tree-item';

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
  const tx = useTx();
  const foldable = new Set(items.filter(item => getParent(item) !== item).map(item => getParent(item)));
  const defaultFolded = items.filter(item => getParent(value) !== item && getParent(getParent(value)) !== item);
  const [foldedByValue, setFoldedByValue] = useState<{ value: ItemType; folded: ItemType[] }[]>([]);
  const folded = foldedByValue.find(entry => entry.value === value)?.folded ?? defaultFolded;

  function onFoldItem(target: ItemType) {
    setFoldedByValue(prevState => {
      const currentFolded = prevState.find(entry => entry.value === value)?.folded ?? defaultFolded;
      const updatedFolded = items.filter(item => {
        if (item === target) {
          return !currentFolded.includes(target);
        }
        if (!currentFolded.includes(target) && (getParent(item) === target || getParent(getParent(item)) === target)) {
          return true;
        } else {
          return currentFolded.includes(item);
        }
      });
      const nextState = prevState.filter(entry => entry.value !== value);
      nextState.push({ value, folded: updatedFolded });
      return nextState;
    });
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
        const description = getDescription(item);
        return (
          <SelectTreeItem
            key={`${prefix}${index}`}
            className={clsx(
              'cc-tree-item relative cc-scroll-row cc-hover-bg',
              isActive ? 'max-h-7 py-1' : 'max-h-0 opacity-0 pointer-events-none',
              value === item && 'cc-selected'
            )}
            description={description}
            onClick={event => handleClickItem(event, item)}
          >
            {foldable.has(item) ? (
              <MiniButton
                aria-label={!folded.includes(item) ? tx('tx.general.fold') : tx('tx.general.unfold')}
                className={clsx('absolute left-1 hover:text-primary', !folded.includes(item) ? 'top-1.5' : 'top-1')}
                noPadding
                icon={!folded.includes(item) ? <IconDropArrow size='1rem' /> : <IconPageRight size='1.25rem' />}
                onClick={event => handleClickFold(event, item)}
              />
            ) : null}
            {getParent(item) === item ? getLabel(item) : `- ${getLabel(item).toLowerCase()}`}
          </SelectTreeItem>
        );
      })}
    </div>
  );
}
