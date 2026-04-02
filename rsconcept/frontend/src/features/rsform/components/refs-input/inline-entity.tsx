'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { IconAccept, IconClose } from '@/components/icons';
import { SearchBar } from '@/components/input';

import { type Grammeme, supportedGrammemes } from '../../models/language';
import { parseEntityReference, parseGrammemes } from '../../models/language-api';
import { type Constituenta, type RSForm } from '../../models/rsform';
import { matchConstituenta } from '../../models/rsform-api';
import { CstMatchMode } from '../../stores/cst-search';

import { type IReferenceInputState } from './refs-input';

const DEFAULT_WORDFORMS: { text: string; grams: Grammeme[]; }[] = [
  { text: 'ед им', grams: ['sing', 'nomn'] },
  { text: 'ед род', grams: ['sing', 'gent'] },
  { text: 'ед дат', grams: ['sing', 'datv'] },
  { text: 'ед вин', grams: ['sing', 'accs'] },
  { text: 'ед твор', grams: ['sing', 'ablt'] },
  { text: 'ед пред', grams: ['sing', 'loct'] },
  { text: 'мн им', grams: ['plur', 'nomn'] },
  { text: 'мн род', grams: ['plur', 'gent'] },
  { text: 'мн дат', grams: ['plur', 'datv'] },
  { text: 'мн вин', grams: ['plur', 'accs'] },
  { text: 'мн твор', grams: ['plur', 'ablt'] },
  { text: 'мн пред', grams: ['plur', 'loct'] }
];

interface InlineEntityEditorProps {
  schema: RSForm;
  initial: IReferenceInputState;
  position: {
    top: number;
    left: number;
  };
  onSave: (value: { entity: string; form: string; }) => void;
  onCancel: () => void;
}

export function InlineEntityEditor({
  schema,
  initial,
  position,
  onSave,
  onCancel
}: InlineEntityEditorProps) {
  const [value, setValue] = useState(() => initInlineEntityReference(initial));
  const [query, setQuery] = useState(() => prepareSelectionPrompt(initial.text));
  const rootRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const source = schema.items.filter(cst => cst.term_resolved !== '');
    const result =
      query.trim() === '' ? source : source.filter(cst => matchConstituenta(cst, query.trim(), CstMatchMode.TERM));
    return result.slice(0, 8);
  }, [query, schema.items]);
  const canSubmit = value.entity.trim() !== '' && value.grams.length > 0;

  function handleSave() {
    if (!canSubmit) {
      return;
    }

    onSave({
      entity: value.entity.trim(),
      form: value.grams.join(',')
    });
  }

  function handleSelectConstituenta(cst: Constituenta) {
    setValue(prev => ({
      ...prev,
      entity: cst.alias
    }));
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
    }
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!rootRef.current?.contains(target)) {
        onCancel();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [onCancel]);

  return (
    <div
      ref={rootRef}
      className='absolute z-topmost w-120 max-w-[min(30rem,calc(100vw-4rem))] cursor-auto'
      style={{ top: position.top, left: position.left }}
      onKeyDown={handleKeyDown}
    >
      <div className='rounded-md border bg-popover px-3 pb-2 shadow-lg'>
        <div className='flex items-center gap-1'>
          <SearchBar
            id='inline_reference_entity_search'
            query={query}
            onChangeQuery={setQuery}
            noBorder
            placeholder='Поиск конституенты'
            className='text-sm bg-input'
          />
          <MiniButton
            icon={<IconAccept size='1.5rem' className='icon-green' />}
            title='Сохранить ссылку'
            onClick={handleSave}
            disabled={!canSubmit}
          />
          <MiniButton icon={<IconClose size='1.5rem' className='icon-primary' />} title='Закрыть' onClick={onCancel} />
        </div>

        <div className='mb-2 max-h-32 overflow-y-auto rounded-md border'>
          {filteredItems.length > 0 ? (
            filteredItems.map(cst => {
              const isSelected = cst.alias === value.entity;
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

        <div className='flex flex-wrap gap-1 select-none'>
          {DEFAULT_WORDFORMS.map(form => {
            const isSelected = form.grams.every(gram => value.grams.includes(gram));
            return (
              <button
                key={form.text}
                type='button'
                className={clsx(
                  'rounded-md border w-18 py-1 text-xs leading-none cc-animate-color',
                  'hover:bg-accent cursor-pointer',
                  isSelected && 'bg-selected text-selected-foreground'
                )}
                onClick={() =>
                  setValue(prev => ({
                    ...prev,
                    grams: supportedGrammemes.filter(gram => form.grams.some(item => item === gram))
                  }))
                }
              >
                {form.text}
              </button>
            );
          })}
        </div>
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

function initInlineEntityReference(initial: IReferenceInputState) {
  if (!initial.refRaw) {
    return {
      entity: '',
      grams: [] as Grammeme[]
    };
  }

  const ref = parseEntityReference(initial.refRaw);
  const grams = parseGrammemes(ref.form);
  return {
    entity: ref.entity,
    grams: supportedGrammemes.filter(data => grams.includes(data))
  };
}
