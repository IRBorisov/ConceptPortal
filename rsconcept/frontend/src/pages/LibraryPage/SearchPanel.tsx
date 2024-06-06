'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import { LocationIcon, SubscribeIcon, VisibilityIcon } from '@/components/DomainIcons';
import { IconEditor, IconFolder, IconOwner } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import MiniButton from '@/components/ui/MiniButton';
import SearchBar from '@/components/ui/SearchBar';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import { LocationHead } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeLocationHead, labelLocationHead } from '@/utils/labels';
import { tripleToggleColor } from '@/utils/utils';

interface SearchPanelProps {
  total: number;
  filtered: number;

  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  path: string;
  setPath: React.Dispatch<React.SetStateAction<string>>;
  head: LocationHead | undefined;
  setHead: React.Dispatch<React.SetStateAction<LocationHead | undefined>>;

  isVisible: boolean | undefined;
  toggleVisible: () => void;
  isOwned: boolean | undefined;
  toggleOwned: () => void;
  isSubscribed: boolean | undefined;
  toggleSubscribed: () => void;
  isEditor: boolean | undefined;
  toggleEditor: () => void;
}

function SearchPanel({
  total,
  filtered,
  query,
  setQuery,
  path,
  setPath,
  head,
  setHead,

  isVisible,
  toggleVisible,
  isOwned,
  toggleOwned,
  isSubscribed,
  toggleSubscribed,
  isEditor,
  toggleEditor
}: SearchPanelProps) {
  const headMenu = useDropdown();

  const handleChange = useCallback(
    (newValue: LocationHead | undefined) => {
      headMenu.hide();
      setHead(newValue);
    },
    [headMenu, setHead]
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
      </div>

      <div className='flex items-center h-full mx-auto'>
        <SearchBar
          id='library_search'
          placeholder='Поиск'
          noBorder
          className='min-w-[7rem] sm:min-w-[10rem]'
          value={query}
          onChange={setQuery}
        />

        <div ref={headMenu.ref} className='flex items-center h-full py-1 select-none'>
          <SelectorButton
            transparent
            className='h-full rounded-lg'
            title={head ? describeLocationHead(head) : 'Выберите каталог'}
            hideTitle={headMenu.isOpen}
            icon={
              head ? (
                <LocationIcon value={head} size='1.25rem' />
              ) : (
                <IconFolder size='1.25rem' className='clr-text-controls' />
              )
            }
            onClick={headMenu.toggle}
            text={head ?? '//'}
          />

          <Dropdown isOpen={headMenu.isOpen} stretchLeft className='z-modalTooltip'>
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

        <SearchBar
          id='path_search'
          placeholder='Путь'
          noIcon
          noBorder
          className='min-w-[5rem]'
          value={path}
          onChange={setPath}
        />
      </div>

      <BadgeHelp topic={HelpTopic.UI_LIBRARY} className='max-w-[28rem] text-sm' offset={5} place='right-start' />
    </div>
  );
}

export default SearchPanel;
