import { IconHelp } from '@/components/Icons';
import Tooltip from '@/components/ui/Tooltip';
import { useLibrary } from '@/context/LibraryContext';
import { LibraryItemID } from '@/models/library';
import { IRSForm } from '@/models/rsform';
import { colorBgSchemas } from '@/styling/color';
import { globals, prefixes } from '@/utils/constants';

interface SchemasGuideProps {
  schema: IRSForm;
}

function SchemasGuide({ schema }: SchemasGuideProps) {
  const library = useLibrary();

  const schemas = (() => {
    const processed = new Set<LibraryItemID>();
    const aliases: string[] = [];
    const indexes: number[] = [];
    schema.items.forEach(cst => {
      if (cst.parent_schema && !processed.has(cst.parent_schema)) {
        const item = library.items.find(item => item.id === cst.parent_schema);
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
    <div tabIndex={-1} id={globals.graph_schemas} className='p-1'>
      <IconHelp size='1.25rem' className='icon-primary' />
      <Tooltip
        anchorSelect={`#${globals.graph_schemas}`}
        layer='z-modalTooltip'
        place='right'
        className='max-w-[25rem] break-words text-base'
      >
        <div>
          <span
            className='min-w-[0.6rem] min-h-[0.6rem] border inline-block mr-1 rounded-full'
            style={{ backgroundColor: colorBgSchemas(0) }}
          />
          Текущая схема
        </div>
        {schemas.map((alias, index) => (
          <div key={`${prefixes.schemas_list}${index}`}>
            <span
              className='min-w-[0.6rem] min-h-[0.6rem] border inline-block mr-1 rounded-full'
              style={{ backgroundColor: colorBgSchemas(index + 1) }}
            />
            {alias}
          </div>
        ))}
      </Tooltip>
    </div>
  );
}

export default SchemasGuide;
