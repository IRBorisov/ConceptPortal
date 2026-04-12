'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { IconAccept, IconClose } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { type Grammeme } from '@/domain/cctext';
import { prepareTooltip } from '@/utils/format';
import { isMac } from '@/utils/utils';

import { type EntityRefState, type InlinePosition } from '../../../../domain/cctext/reference';
import { type Constituenta, type RSForm } from '../../models/rsform';
import { matchConstituenta } from '../../models/rsform-api';
import { CstMatchMode } from '../../stores/cst-search';
import { SelectWordForm } from '../select-word-form';

interface InlineEntityEditorProps {
  schema: RSForm;
  position: InlinePosition;
  initial: EntityRefState;

  onSave: (entity: string, form: string) => void;
  onCancel: () => void;
}

export function InlineEntityEditor({ schema, initial, position, onSave, onCancel }: InlineEntityEditorProps) {
  const [entity, setEntity] = useState<string>(initial.entity);
  const [grams, setGrams] = useState<Grammeme[]>(initial.grams);
  const [query, setQuery] = useState(() => prepareSelectionPrompt(initial.query));
  const rootRef = useRef<HTMLDivElement>(null);

  const searchBarRef = useRef<HTMLInputElement>(null);
  useEffect(function focusSearchAfterMount() {
    searchBarRef.current?.focus();
  }, []);

  const filteredItems = useMemo(() => {
    const source = schema.items.filter(cst => cst.term_resolved !== '');
    const result =
      query.trim() === '' ? source : source.filter(cst => matchConstituenta(cst, query.trim(), CstMatchMode.TERM));
    return result.slice(0, 8);
  }, [query, schema.items]);
  const canSubmit = entity.trim() !== '' && grams.length > 0;

  function handleSave() {
    if (!canSubmit) {
      return;
    }
    onSave(entity.trim(), grams.join(','));
  }

  function handleSelectConstituenta(cst: Constituenta) {
    setEntity(cst.alias);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }

    if (event.altKey && event.key === '1') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleSave();
      return;
    }
  }

  useEffect(
    function closeOnClickOutside() {
      function handlePointerDown(event: PointerEvent) {
        const target = event.target;
        if (target instanceof Node && !rootRef.current?.contains(target)) {
          onCancel();
        }
      }

      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown, true);
      };
    },
    [onCancel]
  );

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className='absolute z-topmost w-120 cursor-auto'
      style={{ top: position.top, left: position.left }}
      onKeyDown={handleKeyDown}
    >
      <div className='rounded-md border bg-popover px-3 pb-3 shadow-lg'>
        <div className='flex items-center gap-1'>
          <MiniButton
            icon={<IconAccept size='1.5rem' className='icon-green' />}
            titleHtml={prepareTooltip('Сохранить ссылку', isMac() ? 'Cmd + Enter' : 'Ctrl + Enter')}
            onClick={handleSave}
            disabled={!canSubmit}
          />
          <MiniButton
            icon={<IconClose size='1.5rem' className='icon-primary' />}
            titleHtml={prepareTooltip('Закрыть', 'Esc')}
            onClick={onCancel}
          />
          <SearchBar
            id='inline_reference_entity_search'
            query={query}
            onChangeQuery={setQuery}
            noBorder
            placeholder='Поиск конституенты'
            className='text-sm bg-input'
            inputRef={searchBarRef}
          />
        </div>

        <div className='max-h-32 overflow-y-auto border-t border-x rounded-none'>
          {filteredItems.length > 0 ? (
            filteredItems.map(cst => {
              const isSelected = cst.alias === entity;
              return (
                <button
                  key={cst.id}
                  type='button'
                  className={clsx(
                    'flex w-full items-start gap-2 border-b px-2 py-1.5 text-sm last:border-b-0',
                    'cc-animate-color hover:bg-accent',
                    isSelected && 'bg-selected text-selected-foreground'
                  )}
                  onClick={() => handleSelectConstituenta(cst)}
                >
                  <span className='min-w-8 rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium text-center'>
                    {cst.alias}
                  </span>
                  <span className='min-w-0 grow truncate text-left'>{cst.term_resolved}</span>
                </button>
              );
            })
          ) : (
            <div className='px-3 py-2 text-sm text-muted-foreground'>Ничего не найдено</div>
          )}
        </div>
        <SelectWordForm value={grams} onChange={setGrams} />
      </div>
    </div>
  );
}

// ========= Internals =======

function prepareSelectionPrompt(text: string | undefined): string {
  if (!text) {
    return '';
  }

  let value = text;
  if (value.includes(' ')) {
    value = value.substring(0, value.indexOf(' '));
  }

  return value.substring(0, Math.max(value.length - 3, 0));
}
