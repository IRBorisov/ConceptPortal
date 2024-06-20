'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import { LocationIcon, SubscribeIcon, VisibilityIcon } from '@/components/DomainIcons';
import { IconEditor, IconFilterReset, IconFolder, IconFolderTree, IconOwner } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SearchBar from '@/components/ui/SearchBar';
import SelectorButton from '@/components/ui/SelectorButton';
import { useAuth } from '@/context/AuthContext';
import useDropdown from '@/hooks/useDropdown';
import { LocationHead } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER, prefixes } from '@/utils/constants';
import { describeLocationHead, labelLocationHead } from '@/utils/labels';
import { tripleToggleColor } from '@/utils/utils';

interface SearchPanelProps {
  total: number;
  filtered: number;
  hasCustomFilter: boolean;

  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  path: string;
  setPath: React.Dispatch<React.SetStateAction<string>>;
  head: LocationHead | undefined;
  setHead: React.Dispatch<React.SetStateAction<LocationHead | undefined>>;

  folderMode: boolean;
  toggleFolderMode: () => void;

  isVisible: boolean | undefined;
  toggleVisible: () => void;
  isOwned: boolean | undefined;
  toggleOwned: () => void;
  isSubscribed: boolean | undefined;
  toggleSubscribed: () => void;
  isEditor: boolean | undefined;
  toggleEditor: () => void;
  resetFilter: () => void;
}

function SearchPanel({
  total,
  filtered,
  hasCustomFilter,

  query,
  setQuery,
  path,
  setPath,
  head,
  setHead,

  folderMode,
  toggleFolderMode,

  isVisible,
  toggleVisible,
  isOwned,
  toggleOwned,
  isSubscribed,
  toggleSubscribed,
  isEditor,
  toggleEditor,
  resetFilter
}: SearchPanelProps) {
  const { user } = useAuth();
  const headMenu = useDropdown();

  const handleChange = useCallback(
    (newValue: LocationHead | undefined) => {
      headMenu.hide();
      setHead(newValue);
    },
    [headMenu, setHead]
  );

  const handleToggleFolder = useCallback(() => {
    headMenu.hide();
    toggleFolderMode();
  }, [headMenu, toggleFolderMode]);

  const handleFolderClick = useCallback(
    (event: CProps.EventMouse) => {
      if (event.ctrlKey) {
        toggleFolderMode();
      } else {
        headMenu.toggle();
      }
    },
    [headMenu, toggleFolderMode]
  );

  return (
    <div
      className={clsx(
        'sticky top-0', // prettier: split lines
        'w-full h-[2.2rem]',
        'flex items-center',
        'border-b',
        'text-sm',
        'clr-input'
      )}
    >
      <div className={clsx('px-3 pt-1 self-center', 'min-w-[5.5rem]', 'select-none', 'whitespace-nowrap')}>
        {filtered} из {total}
      </div>

      {user ? (
        <div className='cc-icons'>
          <MiniButton
            title='Видимость'
            icon={<VisibilityIcon value={true} className={tripleToggleColor(isVisible)} />}
            onClick={toggleVisible}
          />
          <MiniButton
            title='Я - Подписчик'
            icon={<SubscribeIcon value={true} className={tripleToggleColor(isSubscribed)} />}
            onClick={toggleSubscribed}
          />

          <MiniButton
            title='Я - Владелец'
            icon={<IconOwner size='1.25rem' className={tripleToggleColor(isOwned)} />}
            onClick={toggleOwned}
          />

          <MiniButton
            title='Я - Редактор'
            icon={<IconEditor size='1.25rem' className={tripleToggleColor(isEditor)} />}
            onClick={toggleEditor}
          />

          <MiniButton
            title='Сбросить фильтры'
            icon={<IconFilterReset size='1.25rem' className='icon-primary' />}
            onClick={resetFilter}
            disabled={!hasCustomFilter}
          />
        </div>
      ) : null}

      <div className='flex items-center h-full mx-auto'>
        <SearchBar
          id='library_search'
          placeholder='Поиск'
          noBorder
          className='min-w-[7rem] sm:min-w-[10rem]'
          value={query}
          onChange={setQuery}
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
                  <IconFolder size='1.25rem' className='clr-text-controls' />
                )
              }
              onClick={handleFolderClick}
              text={head ?? '//'}
            />

            <Dropdown isOpen={headMenu.isOpen} stretchLeft className='z-modalTooltip'>
              <DropdownButton className='w-[10rem]' title='Переключение в режим Проводник' onClick={handleToggleFolder}>
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
            className='min-w-[4.5rem] sm:min-w-[5rem]'
            value={path}
            onChange={setPath}
          />
        ) : null}
      </div>
      <Overlay position='top-[-0.75rem] right-0'>
        <BadgeHelp
          topic={HelpTopic.UI_LIBRARY}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'text-sm')}
          offset={5}
          place='right-start'
        />
      </Overlay>
    </div>
  );
}

export default SearchPanel;
