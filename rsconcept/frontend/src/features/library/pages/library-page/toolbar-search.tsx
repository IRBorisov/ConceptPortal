'use client';

import clsx from 'clsx';

import { SelectUser } from '@/features/users/components/select-user';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconEditor, IconFilterReset, IconOwner, IconUserSearch } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';
import { tripleToggleColor } from '@/utils/utils';

import { useLibrarySuspense } from '../../backend/use-library';
import { IconItemVisibility } from '../../components/icon-item-visibility';
import { IconShowSidebar } from '../../components/icon-show-sidebar';
import { useHasCustomFilter, useLibrarySearchStore } from '../../stores/library-search';

interface ToolbarSearchProps {
  className?: string;
  total: number;
  filtered: number;
}

export function ToolbarSearch({ className, total, filtered }: ToolbarSearchProps) {
  const { items } = useLibrarySuspense();
  const {
    elementRef: userElementRef,
    handleBlur: userHandleBlur,
    isOpen: isUserOpen,
    toggle: toggleUser
  } = useDropdown();

  const query = useLibrarySearchStore(state => state.query);
  const setQuery = useLibrarySearchStore(state => state.setQuery);
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

  function handleSelectUser(userID: number | null) {
    setFilterUser(userID);
  }

  return (
    <div className={cn('flex gap-3 border-b text-sm bg-input items-center', className)}>
      <div className='ml-3 min-w-18 sm:min-w-30 select-none whitespace-nowrap'>
        {filtered} из {total}
      </div>

      <div className='cc-icons h-full items-center'>
        <MiniButton
          title='Отображение проводника'
          icon={<IconShowSidebar value={!folderMode} size='1.25rem' />}
          onClick={toggleFolderMode}
        />
        <MiniButton
          title='Видимость'
          icon={<IconItemVisibility value={true} className={tripleToggleColor(isVisible)} />}
          onClick={toggleVisible}
        />

        <div ref={userElementRef} onBlur={userHandleBlur} className='relative flex'>
          <MiniButton
            title='Поиск пользователя'
            hideTitle={isUserOpen}
            icon={<IconUserSearch size='1.25rem' className={userActive ? 'icon-green' : 'icon-primary'} />}
            onClick={toggleUser}
          />
          <Dropdown isOpen={isUserOpen} margin='mt-1'>
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
              placeholder='Выбрать владельца'
              noBorder
              className='min-w-60 mx-1 mb-1 cc-hover-bg select-none'
              filter={filterNonEmptyUsers}
              value={filterUser}
              onChange={handleSelectUser}
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
      </div>
    </div>
  );
}
