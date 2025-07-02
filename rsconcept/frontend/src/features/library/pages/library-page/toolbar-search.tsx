'use client';

import clsx from 'clsx';

import { SelectUser } from '@/features/users/components/select-user';

import { MiniButton, SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconEditor,
  IconFilterReset,
  IconFolder,
  IconFolderSearch,
  IconFolderTree,
  IconOwner,
  IconUserSearch
} from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';
import { tripleToggleColor } from '@/utils/utils';

import { useLibrarySuspense } from '../../backend/use-library';
import { IconItemVisibility } from '../../components/icon-item-visibility';
import { IconLocationHead } from '../../components/icon-location-head';
import { describeLocationHead, labelLocationHead } from '../../labels';
import { LocationHead } from '../../models/library';
import { useHasCustomFilter, useLibrarySearchStore } from '../../stores/library-search';

interface ToolbarSearchProps {
  className?: string;
  total: number;
  filtered: number;
}

export function ToolbarSearch({ className, total, filtered }: ToolbarSearchProps) {
  const { items } = useLibrarySuspense();
  const userMenu = useDropdown();
  const headMenu = useDropdown();

  const query = useLibrarySearchStore(state => state.query);
  const setQuery = useLibrarySearchStore(state => state.setQuery);
  const path = useLibrarySearchStore(state => state.path);
  const setPath = useLibrarySearchStore(state => state.setPath);
  const head = useLibrarySearchStore(state => state.head);
  const setHead = useLibrarySearchStore(state => state.setHead);
  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const toggleFolderMode = useLibrarySearchStore(state => state.toggleFolderMode);
  const isOwned = useLibrarySearchStore(state => state.isOwned);
  const toggleOwned = useLibrarySearchStore(state => state.toggleOwned);
  const isEditor = useLibrarySearchStore(state => state.isEditor);
  const toggleEditor = useLibrarySearchStore(state => state.toggleEditor);
  const isVisible = useLibrarySearchStore(state => state.isVisible);
  const toggleVisible = useLibrarySearchStore(state => state.toggleVisible);
  const filterUser = useLibrarySearchStore(state => state.filterUser);
  const setFilterUser = useLibrarySearchStore(state => state.setFilterUser);

  const resetFilter = useLibrarySearchStore(state => state.resetFilter);
  const hasCustomFilter = useHasCustomFilter();

  const userActive = isOwned !== null || isEditor !== null || filterUser !== null;

  function filterNonEmptyUsers(userID: number): boolean {
    return items.some(item => item.owner === userID);
  }

  function handleChange(newValue: LocationHead | null) {
    headMenu.hide();
    setHead(newValue);
  }

  function handleToggleFolder() {
    headMenu.hide();
    toggleFolderMode();
  }

  function handleFolderClick(event: React.MouseEvent<Element>) {
    if (event.ctrlKey || event.metaKey) {
      toggleFolderMode();
    } else {
      headMenu.toggle();
    }
  }

  return (
    <div className={cn('flex gap-3 border-b text-sm bg-input items-center', className)}>
      <div className='ml-3 min-w-18 sm:min-w-30 select-none whitespace-nowrap'>
        {filtered} из {total}
      </div>

      <div className='cc-icons h-full items-center'>
        <MiniButton
          title='Видимость'
          icon={<IconItemVisibility value={true} className={tripleToggleColor(isVisible)} />}
          onClick={toggleVisible}
        />

        <div ref={userMenu.ref} onBlur={userMenu.handleBlur} className='relative flex'>
          <MiniButton
            title='Поиск пользователя'
            hideTitle={userMenu.isOpen}
            icon={<IconUserSearch size='1.25rem' className={userActive ? 'icon-green' : 'icon-primary'} />}
            onClick={userMenu.toggle}
          />
          <Dropdown isOpen={userMenu.isOpen}>
            <DropdownButton
              text='Я - Владелец'
              title='Фильтровать схемы, в которых текущий пользователь является владельцем'
              icon={<IconOwner size='1.25rem' className={tripleToggleColor(isOwned)} />}
              onClick={toggleOwned}
            />
            <DropdownButton
              text='Я - Редактор'
              title='Фильтровать схемы, в которых текущий пользователя является редактором'
              icon={<IconEditor size='1.25rem' className={tripleToggleColor(isEditor)} />}
              onClick={toggleEditor}
            />
            <SelectUser
              aria-label='Выбор пользователя для фильтра по владельцу'
              placeholder='Выберите владельца'
              noBorder
              className='min-w-60 mx-1 mb-1'
              filter={filterNonEmptyUsers}
              value={filterUser}
              onChange={setFilterUser}
            />
          </Dropdown>
        </div>

        <MiniButton
          title='Сбросить фильтры'
          icon={<IconFilterReset size='1.25rem' className='icon-primary' />}
          onClick={resetFilter}
          disabled={!hasCustomFilter}
        />
      </div>

      <div className='flex h-full grow pr-4 sm:pr-12'>
        <SearchBar
          id='library_search'
          placeholder='Поиск'
          noBorder
          className={clsx('min-w-28 sm:min-w-40 max-w-80', folderMode && 'grow')}
          query={query}
          onChangeQuery={setQuery}
        />
        {!folderMode ? (
          <div
            ref={headMenu.ref}
            onBlur={headMenu.handleBlur}
            className='relative flex items-center h-full select-none'
          >
            <SelectorButton
              className='rounded-lg py-1'
              titleHtml={
                (head ? describeLocationHead(head) : 'Выберите каталог') + '<br/><kbd>Ctrl + клик</kbd> - Проводник'
              }
              hideTitle={headMenu.isOpen}
              icon={head ? <IconLocationHead value={head} size='1.25rem' /> : <IconFolderSearch size='1.25rem' />}
              onClick={handleFolderClick}
            />

            <Dropdown isOpen={headMenu.isOpen} stretchLeft>
              <DropdownButton
                text='проводник...'
                title='Переключение в режим Проводник'
                icon={<IconFolderTree size='1rem' className='icon-primary' />}
                onClick={handleToggleFolder}
              />
              <DropdownButton
                text='отображать все'
                title='Очистить фильтр по расположению'
                icon={<IconFolder size='1rem' className='icon-primary' />}
                onClick={() => handleChange(null)}
              />
              {Object.values(LocationHead).map((head, index) => {
                return (
                  <DropdownButton
                    key={`${prefixes.location_head_list}${index}`}
                    text={labelLocationHead(head)}
                    title={describeLocationHead(head)}
                    onClick={() => handleChange(head)}
                    icon={<IconLocationHead value={head} size='1rem' />}
                  />
                );
              })}
            </Dropdown>
          </div>
        ) : null}
        {!folderMode ? (
          <SearchBar
            id='path_search'
            placeholder='Путь'
            noIcon
            noBorder
            className='w-18 sm:w-20 grow ml-1'
            query={path}
            onChangeQuery={setPath}
          />
        ) : null}
      </div>
    </div>
  );
}
