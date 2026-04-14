'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { Button, MiniButton } from '@/components/control';
import { IconAccept, IconClose, IconNewItem } from '@/components/icons';
import { Label, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';
import { isMac } from '@/utils/utils';

interface PopoverExtractionProps {
  className?: string;
  disabled: boolean;
  onSubmit: (newText: string) => void;
}

export function PopoverExtraction({ disabled, className, onSubmit }: PopoverExtractionProps) {
  const extractPopoverRef = useRef<HTMLDivElement>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const intentOpen = panelOpen && !disabled;
  const [debouncedOpen] = useDebounce(intentOpen, PARAMETER.moveDuration);
  const popoverInDom = intentOpen || debouncedOpen;

  const [termInput, setTermInput] = useState('');

  useEffect(
    function resetPanelWhenDisabled() {
      if (!disabled) {
        return;
      }
      const id = requestAnimationFrame(function deferPanelClose() {
        setPanelOpen(false);
      });
      return () => cancelAnimationFrame(id);
    },
    [disabled]
  );

  useEffect(
    function closeExtractOnClickOutside() {
      if (!popoverInDom) {
        return;
      }
      function handlePointerDown(event: PointerEvent) {
        const target = event.target;
        if (target instanceof Node && !extractPopoverRef.current?.contains(target)) {
          setPanelOpen(false);
        }
      }
      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown, true);
      };
    },
    [popoverInDom]
  );

  useEffect(
    function focusTermWhenPopoverOpened() {
      if (popoverInDom && intentOpen) {
        document.getElementById('dlg_show_ast_extract_term')?.focus();
      }
    },
    [popoverInDom, intentOpen]
  );

  function handleOpenPopover(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setTermInput('');
    setPanelOpen(true);
  }

  function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPanelOpen(false);
    onSubmit(termInput);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setPanelOpen(false);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      setPanelOpen(false);
      onSubmit(termInput);
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
            'rounded-md border bg-popover px-3 pb-3 pt-1 shadow-lg outline-hidden',
            'cc-popover-extract',
            intentOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-1/2 opacity-0'
          )}
          onKeyDown={handleKeyDown}
        >
          <div className='flex flex-wrap items-center gap-2'>
            <div className='cc-icons'>
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
                onClick={() => setPanelOpen(false)}
              />
            </div>
            <Label text='Термин' />
          </div>
          <TextInput
            id='dlg_show_ast_extract_term'
            dense
            className='text-sm w-80'
            value={termInput}
            onChange={event => setTermInput(event.target.value)}
            disabled={disabled}
          />
        </div>
      ) : null}
    </div>
  );
}
