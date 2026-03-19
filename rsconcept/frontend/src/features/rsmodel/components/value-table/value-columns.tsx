import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { type RSForm } from '@/features/rsform';
import { TypeID, type Typification, type Value } from '@/features/rslang';
import { valueStub } from '@/features/rslang/eval/value-api';

import { type BasicsContext } from '../../models/rsmodel';
import { prepareValueString } from '../../models/rsmodel-api';

const columnHelper = createColumnHelper<Value>();

// export interface ColumnServices {
//   navigateValue: (path: number[]) => void;
//   editElement: (path: number[]) => void;
//   deleteElement: (path: number[]) => void;
// }

export function createColumnsType(
  type: Typification,
  schema: RSForm,
  basics: BasicsContext,
  showDataText: boolean,
  path: string = 'val',
  valueAccessor: (value: Value) => Value = value => value
): ReturnType<typeof columnHelper.accessor>[] {
  switch (type.typeID) {
    case TypeID.integer: return [
      columnHelper.accessor(value => valueAccessor(value) as number, {
        id: `${path}_int`,
        header: () => <span className='min-w-2'>Z</span>,
        size: 60,
        minSize: 60,
        maxSize: 60,
        cell: props => props.getValue()
      })
    ];
    case TypeID.basic: return [
      columnHelper.accessor(value => valueAccessor(value) as number, {
        id: `${path}_${type.baseID}`,
        header: type.baseID,
        size: showDataText ? 100 : 60,
        minSize: showDataText ? 100 : 60,
        maxSize: showDataText ? 100 : 60,
        cell: props => prepareValueString(props.getValue(), type, schema, basics, showDataText)
      })
    ];
    case TypeID.collection: return [
      columnHelper.accessor(value => valueAccessor(value) as Value[], {
        id: `${path}_card`,
        header: () => <span className='min-w-4'>ℬ</span>,
        size: 60,
        minSize: 60,
        maxSize: 60,
        cell: props => props.getValue().length
      }),
      columnHelper.accessor(value => valueAccessor(value) as Value[], {
        id: `${path}_stub`,
        header: '',
        size: 80,
        minSize: 80,
        maxSize: 80,
        cell: props => <span className='min-w-16'>{valueStub(props.getValue())}</span>
      })
    ];
    case TypeID.tuple: {
      const components: ColumnDef<Value, unknown>[] = [];
      for (let i = 0; i < type.factors.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        components.push(...createColumnsType(
          type.factors[i],
          schema,
          basics,
          showDataText,
          `${path}_${i}`,
          value => ((valueAccessor(value) as Value[])[i + 1])
        ));
      }
      return components;
    }
  }
  return [];
}
