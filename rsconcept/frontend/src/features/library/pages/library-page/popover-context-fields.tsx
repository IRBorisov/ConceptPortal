'use client';

import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { IconText } from '@/components/icons';
import { Checkbox } from '@/components/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/utils';

import {
  isDefaultContextSearchFields,
  LIBRARY_CONTEXT_SEARCH_FIELDS,
  type LibraryContextSearchField
} from '../../models/library-context-search';
import { useLibrarySearchStore } from '../../stores/library-search';

interface PopoverContextFieldsProps {
  className?: string;
}

function contextFieldLabel(tx: ReturnType<typeof useTx>, field: LibraryContextSearchField): string {
  switch (field) {
    case 'alias':
      return tx('tx.lib.alias');
    case 'title':
      return tx('tx.lib.title');
    case 'description':
      return tx('tx.lib.description');
    case 'term':
      return tx('tx.cst.type.term');
    case 'definition_formal':
      return tx('tx.lib.defineFormal');
    case 'definition_text':
      return tx('tx.lib.defineText');
    case 'convention':
      return tx('tx.lib.convention');
    case 'operation':
      return tx('tx.schema.operation.plural');
    case 'block':
      return tx('tx.oss.block.plural');
    default:
      return field;
  }
}

export function PopoverContextFields({ className }: PopoverContextFieldsProps) {
  const tx = useTx();
  const contextFields = useLibrarySearchStore(state => state.contextFields);
  const setContextField = useLibrarySearchStore(state => state.setContextField);
  const resetContextFields = useLibrarySearchStore(state => state.resetContextFields);
  const allEnabled = isDefaultContextSearchFields(contextFields);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <MiniButton
            className={cn(className, !allEnabled ? 'text-primary' : undefined)}
            title={tx('tx.lib.search.context.fields')}
            icon={<IconText size='1.25rem' className='icon-primary' />}
          />
        }
      />
      <PopoverContent align='start' className='w-64 p-3 flex flex-col gap-2'>
        <div className='text-sm font-medium'>{tx('tx.lib.search.context.fields')}</div>
        {LIBRARY_CONTEXT_SEARCH_FIELDS.map(field => (
          <Checkbox
            key={field}
            label={contextFieldLabel(tx, field)}
            value={contextFields[field]}
            onChange={enabled => setContextField(field, enabled)}
          />
        ))}
        <button
          type='button'
          className='text-sm text-primary disabled:opacity-50 self-start mt-1'
          onClick={resetContextFields}
          disabled={allEnabled}
        >
          {tx('tx.lib.search.context.fields.reset')}
        </button>
      </PopoverContent>
    </Popover>
  );
}
