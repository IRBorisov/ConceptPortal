'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { IconAccept, IconClose, IconPageLeft, IconPageRight } from '@/components/icons';
import { Label, TextInput } from '@/components/input';
import { prepareTooltip } from '@/utils/format';
import { isMac } from '@/utils/utils';

import { type InlinePosition, type SyntacticRefState } from './refs-models';

interface InlineSyntacticEditorProps {
  position: InlinePosition;
  initial: SyntacticRefState;

  onSave: (offset: number, nominal: string) => void;
  onCancel: () => void;
}

export function InlineSyntacticEditor({
  position,
  initial,
  onSave,
  onCancel
}: InlineSyntacticEditorProps) {
  const [offset, setOffset] = useState(initial.offset ?? 1);
  const [nominal, setNominal] = useState(initial.nominal ?? '');
  const rootRef = useRef<HTMLDivElement>(null);
  const nominalInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = offset !== 0 && nominal.trim() !== '';
  const positionIndex =
    offset > 0 ? initial.baseIndex + (offset - 1) : initial.baseIndex + offset;
  const isOffsetValid = offset !== 0 && positionIndex >= 0 && positionIndex < initial.refsCount;

  function handleSave() {
    if (!canSubmit) {
      return;
    }
    onSave(offset, nominal.trim());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleSave();
      return;
    }
  }

  useEffect(function closeOnClickOutside() {
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
  }, [onCancel]);

  useEffect(function focusInputOnMount() {
    nominalInputRef.current?.focus();
  }, []);

  const buttonClass = clsx(
    '-my-1',
    'cc-hover-text cc-animate-color',
    'focus-outline rounded-md',
    'disabled:opacity-75 not-[:disabled]:cursor-pointer'
  );

  return (
    <div
      tabIndex={-1}
      ref={rootRef}
      className='absolute z-topmost w-[20rem] max-w-[min(20rem,calc(100vw-4rem))]'
      style={{ top: position.top, left: position.left }}
      onKeyDown={handleKeyDown}
    >
      <div className='rounded-md border bg-popover p-2 shadow-lg'>
        <TextInput
          id='inline_reference_nominal'
          placeholder='Начальная форма'
          className='text-sm'
          value={nominal}
          ref={nominalInputRef}
          onChange={event => setNominal(event.target.value)}
        />

        <div className='mt-2 flex items-center justify-between gap-1'>
          <Label text='Опорная ссылка' />
          <button
            type='button'
            aria-label='Предыдущая ссылка'
            className={buttonClass}
            onClick={() => setOffset(prev => stepOffset(prev, -1))}
          >
            <IconPageLeft size='1.5rem' />
          </button>
          <input
            id='inline_reference_offset'
            aria-label='Смещение опорной ссылки'
            className={clsx('w-12 text-center focus-outline rounded-md p-0 border',
              isOffsetValid ? 'border-constructive/50 bg-constructive/5' : 'border-destructive/50 bg-destructive/5'
            )}
            value={offset}
            onChange={event => setOffset(Number(event.target.value))}
          />
          <button
            type='button'
            aria-label='Следующая ссылка'
            className={buttonClass}
            onClick={() => setOffset(prev => stepOffset(prev, 1))}
          >
            <IconPageRight size='1.5rem' />
          </button>

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
        </div>
      </div>
    </div>
  );
}

// ========= Internals =======
function stepOffset(offset: number, delta: -1 | 1) {
  const next = offset + delta;
  return next === 0 ? next + delta : next;
}