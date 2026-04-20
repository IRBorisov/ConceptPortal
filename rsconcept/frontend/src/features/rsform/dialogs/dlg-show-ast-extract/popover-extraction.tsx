'use client';

import { useEffect, useRef, useState } from 'react';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { type RSForm } from '@/domain/library/rsform';

import { RefsInput } from '@/features/rsform/components/refs-input/refs-input';

import { Button, MiniButton } from '@/components/control';
import { IconAccept, IconClose, IconNewItem } from '@/components/icons';
import { cn } from '@/components/utils';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';
import { isMac } from '@/utils/utils';

interface PopoverExtractionProps {
  className?: string;
  disabled: boolean;
  schema: RSForm;
  onSubmit: (term: string, definitionText: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  focusRef: React.RefObject<ReactCodeMirrorRef | null>;
}

export function PopoverExtraction({
  disabled,
  className,
  schema,
  open,
  focusRef,
  setOpen,
  onSubmit
}: PopoverExtractionProps) {
  const extractPopoverRef = useRef<HTMLDivElement>(null);

  const intentOpen = open && !disabled;
  const [debouncedOpen] = useDebounce(intentOpen, PARAMETER.moveDuration);
  const popoverInDom = intentOpen || debouncedOpen;

  const [termText, setTermText] = useState('');
  const [definition, setDefinition] = useState('');

  useEffect(
    function resetPanelWhenDisabled() {
      if (!disabled) {
        return;
      }
      const id = requestAnimationFrame(function deferPanelClose() {
        setOpen(false);
      });
      return () => cancelAnimationFrame(id);
    },
    [disabled, setOpen]
  );

  function handleOpenPopover(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setTermText('');
    setDefinition('');
    setOpen(true);
    setTimeout(function focusTermInput() {
      focusRef.current?.view?.focus();
    }, PARAMETER.minimalTimeout);
  }

  function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    onSubmit(termText, definition);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      onSubmit(termText, definition);
    }
  }

  return (
    <div ref={extractPopoverRef} className={cn('flex flex-col gap-2', className)}>
      {!popoverInDom ? (
        <Button
          icon={<IconNewItem size='1.1rem' className='icon-primary' />}
          text='Обособить'
          titleHtml='Вынести выбранное подвыражение в новую конституенту'
          className={clsx(
            'font-controls font-bold text-sm text-primary/75',
            'bg-background/90 backdrop-blur-3xl cc-fade-in',
            'rounded-full gap-1'
          )}
          onClick={handleOpenPopover}
          disabled={disabled}
        />
      ) : null}
      {popoverInDom ? (
        <div
          tabIndex={-1}
          className={cn(
            'rounded-md border bg-popover px-3 py-3 shadow-lg outline-hidden',
            'flex flex-col gap-2',
            'cc-popover-extract',
            intentOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-1/2 opacity-0'
          )}
          onKeyDown={handleKeyDown}
        >
          <div className='flex items-start gap-2'>
            <div className='cc-icons mt-1'>
              <MiniButton
                icon={<IconAccept size='1.25rem' className='icon-green' />}
                titleHtml={prepareTooltip(
                  'Подтвердить обособление выбранного подвыражения',
                  isMac() ? 'Cmd + Enter' : 'Ctrl + Enter'
                )}
                onClick={handleSubmit}
                disabled={disabled}
              />
              <MiniButton
                icon={<IconClose size='1.25rem' className='icon-primary' />}
                titleHtml={prepareTooltip('Закрыть', 'Esc')}
                onClick={() => setOpen(false)}
              />
            </div>
            <RefsInput
              ref={focusRef}
              id='dlg_show_ast_extract_term'
              className='w-full'
              areaClassName='text-sm'
              aria-label='Термин новой конституенты'
              placeholder='Новый термин'
              value={termText}
              resolved={termText}
              onChange={setTermText}
              schema={schema}
              portalHoverTooltips
              maxHeight='5rem'
              disabled={disabled}
            />
          </div>

          <RefsInput
            id='dlg_show_ast_extract_definition'
            className='w-96'
            areaClassName='text-sm'
            aria-label='Определение новой конституенты'
            placeholder='Определение обособленного выражения'
            value={definition}
            resolved={definition}
            onChange={setDefinition}
            schema={schema}
            portalHoverTooltips
            maxHeight='7rem'
            disabled={disabled}
          />
        </div>
      ) : null}
    </div>
  );
}
