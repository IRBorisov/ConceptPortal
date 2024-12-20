'use client';

import clsx from 'clsx';

import { LocationIcon, VisibilityIcon } from '@/components/DomainIcons';
import {
  IconEditor,
  IconFilterReset,
  IconFolder,
  IconFolderSearch,
  IconFolderTree,
  IconOwner,
  IconUserSearch
} from '@/components/Icons';
import { CProps } from '@/components/props';
import SelectUser from '@/components/select/SelectUser';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import MiniButton from '@/components/ui/MiniButton';
import SearchBar from '@/components/ui/SearchBar';
import SelectorButton from '@/components/ui/SelectorButton';
import { useUsers } from '@/context/UsersContext';
import useDropdown from '@/hooks/useDropdown';
import { LocationHead } from '@/models/library';
import { UserID } from '@/models/user';
import { prefixes } from '@/utils/constants';
import { describeLocationHead, labelLocationHead } from '@/utils/labels';
import { tripleToggleColor } from '@/utils/utils';

interface ToolbarSearchProps {
  total: number;
  filtered: number;
  hasCustomFilter: boolean;

  query: string;
  onChangeQuery: (newValue: string) => void;
  path: string;
  onChangePath: (newValue: string) => void;
  head: LocationHead | undefined;
  onChangeHead: (newValue: LocationHead | undefined) => void;

  folderMode: boolean;
  toggleFolderMode: () => void;

  isVisible: boolean | undefined;
  toggleVisible: () => void;
  isOwned: boolean | undefined;
  toggleOwned: () => void;
  isEditor: boolean | undefined;
  toggleEditor: () => void;
  filterUser: UserID | undefined;
  onChangeFilterUser: (newValue: UserID | undefined) => void;

  resetFilter: () => void;
}

function ToolbarSearch({
  total,
  filtered,
  hasCustomFilter,

  query,
  onChangeQuery,
  path,
  onChangePath,
  head,
  onChangeHead,

  folderMode,
  toggleFolderMode,

  isVisible,
  toggleVisible,
  isOwned,
  toggleOwned,
  isEditor,
  toggleEditor,
  filterUser,
  onChangeFilterUser,

  resetFilter
}: ToolbarSearchProps) {
  const headMenu = useDropdown();
  const userMenu = useDropdown();
  const { users } = useUsers();

  const userActive = isOwned !== undefined || isEditor !== undefined || filterUser !== undefined;

  function handleChange(newValue: LocationHead | undefined) {
    headMenu.hide();
    onChangeHead(newValue);
  }

  function handleToggleFolder() {
    headMenu.hide();
    toggleFolderMode();
  }

  function handleFolderClick(event: CProps.EventMouse) {
    if (event.ctrlKey || event.metaKey) {
      toggleFolderMode();
    } else {
      headMenu.toggle();
    }
  }

  return (
    <div
      className={clsx(
        'sticky top-0', // prettier: split lines
        'h-[2.2rem]',
        'flex items-center gap-3',
        'border-b',
        'text-sm',
        'clr-input'
      )}
    >
      <div
        className={clsx(
          'ml-3 pt-1 self-center',
          'min-w-[4.5rem] sm:min-w-[7.4rem]',
          'select-none',
          'whitespace-nowrap'
        )}
      >
        {filtered} из {total}
      </div>

      <div className='cc-icons'>
        <MiniButton
          title='Видимость'
          icon={<VisibilityIcon value={true} className={tripleToggleColor(isVisible)} />}
          onClick={toggleVisible}
        />

        <div ref={userMenu.ref} className='flex'>
          <MiniButton
            title='Поиск пользователя'
            hideTitle={userMenu.isOpen}
            icon={<IconUserSearch size='1.25rem' className={userActive ? 'icon-green' : 'icon-primary'} />}
            onClick={userMenu.toggle}
          />
          <Dropdown isOpen={userMenu.isOpen}>
            <DropdownButton
              text='Я - Владелец'
              icon={<IconOwner size='1.25rem' className={tripleToggleColor(isOwned)} />}
              onClick={toggleOwned}
            />
            <DropdownButton
              text='Я - Редактор'
              icon={<IconEditor size='1.25rem' className={tripleToggleColor(isEditor)} />}
              onClick={toggleEditor}
            />
            <SelectUser
              noBorder
              placeholder='Выберите владельца'
              className='min-w-[15rem] text-sm mx-1 mb-1'
              items={users}
              value={filterUser}
              onSelectValue={onChangeFilterUser}
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

      <div className='flex h-full flex-grow pr-4'>
        <SearchBar
          id='library_search'
          placeholder='Поиск'
          noBorder
          className={clsx('min-w-[7rem] sm:min-w-[10rem] max-w-[20rem]', folderMode && 'flex-grow')}
          query={query}
          onChangeQuery={onChangeQuery}
        />
        {!folderMode ? (
          <div ref={headMenu.ref} className='flex items-center h-full py-1 select-none'>
            <SelectorButton
              transparent
              className='h-full rounded-lg'
              titleHtml={(head ? describeLocationHead(head) : 'Выберите каталог') + '<br/>Ctrl + клик - Проводник'}
              hideTitle={headMenu.isOpen}
              icon={
                head ? (
                  <LocationIcon value={head} size='1.25rem' />
                ) : (
                  <IconFolderSearch size='1.25rem' className='clr-text-controls' />
                )
              }
              onClick={handleFolderClick}
              text={head ?? '//'}
            />

            <Dropdown isOpen={headMenu.isOpen} stretchLeft className='z-modalTooltip'>
              <DropdownButton title='Переключение в режим Проводник' onClick={handleToggleFolder}>
                <div className='inline-flex items-center gap-3'>
                  <IconFolderTree size='1rem' className='clr-text-controls' />
                  <span>проводник...</span>
                </div>
              </DropdownButton>
              <DropdownButton className='w-[10rem]' onClick={() => handleChange(undefined)}>
                <div className='inline-flex items-center gap-3'>
                  <IconFolder size='1rem' className='clr-text-controls' />
                  <span>отображать все</span>
                </div>
              </DropdownButton>
              {Object.values(LocationHead).map((head, index) => {
                return (
                  <DropdownButton
                    className='w-[10rem]'
                    key={`${prefixes.location_head_list}${index}`}
                    onClick={() => handleChange(head)}
                    title={describeLocationHead(head)}
                  >
                    <div className='inline-flex items-center gap-3'>
                      <LocationIcon value={head} size='1rem' />
                      {labelLocationHead(head)}
                    </div>
                  </DropdownButton>
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
            className='w-[4.5rem] sm:w-[5rem] flex-grow'
            query={path}
            onChangeQuery={onChangePath}
          />
        ) : null}
      </div>
    </div>
  );
}

export default ToolbarSearch;
