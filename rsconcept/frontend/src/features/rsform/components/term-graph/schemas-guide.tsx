import { useLibrary } from '@/features/library/backend/use-library';

import { Tooltip } from '@/components/container';
import { IconHelp } from '@/components/icons';
import { globalIDs, prefixes } from '@/utils/constants';

import { colorBgSchemas } from '../../colors';
import { type IRSForm } from '../../models/rsform';

interface SchemasGuideProps {
  schema: IRSForm;
}

export function SchemasGuide({ schema }: SchemasGuideProps) {
  const libraryItems = useLibrary().items;

  const schemas = (() => {
    const processed = new Set<number>();
    const aliases: string[] = [];
    const indexes: number[] = [];
    schema.items.forEach(cst => {
      if (cst.parent_schema !== null && !processed.has(cst.parent_schema)) {
        const item = libraryItems.find(item => item.id === cst.parent_schema);
        if (item) {
          aliases.push(item.alias);
        } else {
          aliases.push(`Схема ${cst.parent_schema_index}`);
        }
        processed.add(cst.parent_schema);
        indexes.push(cst.parent_schema_index);
      }
    });
    const result: string[] = [];
    for (let i = 1; i <= aliases.length; i++) {
      const trueIndex = indexes.findIndex(index => index === i);
      result.push(aliases[trueIndex]);
    }
    return result;
  })();

  return (
    <div className='p-1' tabIndex={-1} id={globalIDs.graph_schemas}>
      <IconHelp size='1.25rem' className='text-muted-foreground hover:icon-primary' />
      <Tooltip
        anchorSelect={`#${globalIDs.graph_schemas}`}
        place='right'
        className='z-topmost grid max-w-100 wrap-break-word text-base'
      >
        <div className='inline-flex items-center gap-2'>
          <span className='w-3 h-3 border rounded-full' style={{ backgroundColor: colorBgSchemas(0) }} />
          <span>Текущая схема</span>
        </div>
        {schemas.map((alias, index) => (
          <div key={`${prefixes.schemas_list}${index}`} className='inline-flex items-center gap-2'>
            <span className='w-3 h-3 border rounded-full' style={{ backgroundColor: colorBgSchemas(index + 1) }} />
            <span>{alias}</span>
          </div>
        ))}
      </Tooltip>
    </div>
  );
}
