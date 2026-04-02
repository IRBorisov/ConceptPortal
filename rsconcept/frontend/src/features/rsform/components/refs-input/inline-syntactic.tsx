'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { IconAccept, IconClose, IconPageLeft, IconPageRight } from '@/components/icons';
import { Label, TextInput } from '@/components/input';

import { parseSyntacticReference } from '../../models/language-api';

import { type IReferenceInputState } from './refs-input';

interface InlineSyntacticEditorProps {
  initial: IReferenceInputState;
  position: {
    top: number;
    left: number;
  };
  onSave: (value: { offset: number; nominal: string; }) => void;
  onCancel: () => void;
}

function initInlineSyntacticReference(initial: IReferenceInputState) {
  if (!initial.refRaw) {
    return {
      offset: 1,
      nominal: initial.text ?? ''
    };
  }

  return parseSyntacticReference(initial.refRaw);
}

function stepOffset(offset: number, delta: -1 | 1) {
  const next = offset + delta;
  return next === 0 ? next + delta : next;
}

export function InlineSyntacticEditor({
  initial,
  position,
  onSave,
  onCancel
}: InlineSyntacticEditorProps) {
  const [value, setValue] = useState(() => initInlineSyntacticReference(initial));
  const rootRef = useRef<HTMLDivElement>(null);

  const canSubmit = value.offset !== 0 && value.nominal.trim() !== '';
  const isOffsetValid = (() => {
    const positionIndex =
      value.offset > 0 ? initial.basePosition + (value.offset - 1) : initial.basePosition + value.offset;
    return value.offset !== 0 && positionIndex >= 0 && positionIndex < initial.mainRefs.length;
  })();
  const initialValue = useMemo(() => initInlineSyntacticReference(initial), [initial]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleSave() {
    if (!canSubmit) {
      return;
    }

    onSave({
      offset: value.offset,
      nominal: value.nominal.trim()
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }

    if (event.altKey && event.key === '2') {
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

  const buttonClass = clsx(
    '-my-1',
    'cc-hover-text cc-animate-color',
    'focus-outline rounded-md',
    'disabled:opacity-75 not-[:disabled]:cursor-pointer'
  );

  return (
    <div
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
          value={value.nominal}
          onChange={event =>
            setValue(prev => ({
              ...prev,
              nominal: event.target.value
            }))
          }
        />

        <div className='mt-2 flex items-center justify-between gap-1'>
          <Label text='Опорная ссылка' />
          <button
            type='button'
            aria-label='Предыдущая ссылка'
            className={buttonClass}
            onClick={() =>
              setValue(prev => ({
                ...prev,
                offset: stepOffset(prev.offset, -1)
              }))
            }
          >
            <IconPageLeft size='1.5rem' />
          </button>
          <input
            id='inline_reference_offset'
            aria-label='Смещение опорной ссылки'
            className={clsx('w-12 text-center focus-outline rounded-md p-0 border',
              isOffsetValid ? 'border-constructive/50 bg-constructive/5' : 'border-destructive/50 bg-destructive/5'
            )}
            value={value.offset}
            onChange={event =>
              setValue(prev => ({
                ...prev,
                offset: Number(event.target.value)
              }))}
          />
          <button
            type='button'
            aria-label='Следующая ссылка'
            className={buttonClass}
            onClick={() =>
              setValue(prev => ({
                ...prev,
                offset: stepOffset(prev.offset, 1)
              }))
            }
          >
            <IconPageRight size='1.5rem' />
          </button>

          <MiniButton
            icon={<IconAccept size='1.5rem' className='icon-green' />}
            title='Сохранить ссылку'
            onClick={handleSave}
            disabled={!canSubmit}
          />
          <MiniButton icon={<IconClose size='1.5rem' className='icon-primary' />} title='Закрыть' onClick={onCancel} />
        </div>
      </div>
    </div>
  );
}
