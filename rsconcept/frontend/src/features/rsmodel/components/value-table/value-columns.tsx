import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { type RSForm } from '@/features/rsform';
import { makeValuePath, TypeID, type Typification, type Value, type ValuePath } from '@/features/rslang';
import { valueStub } from '@/features/rslang/eval/value-api';
import { type EchelonCollection } from '@/features/rslang/semantic/typification';

import { MiniButton } from '@/components/control';
import { IconRemove } from '@/components/icons';
import { globalIDs } from '@/utils/constants';

import { type BasicsContext } from '../../models/rsmodel';
import { prepareValueString } from '../../models/rsmodel-api';

const columnHelper = createColumnHelper<Value>();

export interface ColumnServices {
  schema: RSForm;
  basics: BasicsContext;
  showDataText: boolean;
  getColumnText: (path: ValuePath) => string;
  navigateValue: (path: ValuePath) => void;
  editElement?: (path: ValuePath) => void;
  deleteElement?: (target: number) => void;
}

interface ColumnState {
  singleton: boolean;
  path: ValuePath;
  accessor: (value: Value) => Value;
}

export function createColumnsType(
  type: Typification,
  services: ColumnServices
): ReturnType<typeof columnHelper.accessor>[] {
  const state = {
    singleton: type.typeID !== TypeID.collection,
    path: makeValuePath([]),
    accessor: (value: Value) => value
  };
  const columns = createColumnsInternal(state.singleton ? type : (type as EchelonCollection).base, services, state);
  if (services.deleteElement) {
    columns.push(
      columnHelper.display({
        id: 'actions',
        size: 0,
        cell: props => (
          <MiniButton
            title='Удалить элемент'
            className='align-middle w-fit'
            noPadding
            icon={<IconRemove size='1.25rem' className='cc-remove' />}
            onClick={() => services.deleteElement!(props.row.index)}
          />
        )
      })
    );
  }
  return columns;
}

// ====== Internals ======

function TitledHeader({ text, title, className }: { text: string, title?: string, className?: string; }) {
  return (
    <span
      className={className}
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
    >
      {text}
    </span>
  );
}

function createColumnsInternal(
  type: Typification,
  services: ColumnServices,
  state: ColumnState
): ReturnType<typeof columnHelper.accessor>[] {
  const pathStr = state.path.join('_');
  const headerPath = state.singleton ? state.path : makeValuePath([0, ...state.path]);
  const columnTitle = services.getColumnText(headerPath);
  const elementPath = (rowIndex: number) => state.singleton ? state.path : makeValuePath([rowIndex, ...state.path]);
  switch (type.typeID) {
    case TypeID.integer: return [
      columnHelper.accessor(value => state.accessor(value) as number, {
        id: `B${pathStr}_Z`,
        header: () => <TitledHeader
          className='min-w-2'
          text='Z'
          title={columnTitle}
        />,
        size: 60,
        minSize: 60,
        maxSize: 60,
        cell: props => <span
          className={services.editElement ? 'cursor-pointer' : ''}
          onClick={services.editElement ? () => services.editElement!(elementPath(props.row.index)) : undefined}
        >
          {props.getValue()}
        </span>
      })
    ];
    case TypeID.basic: return [
      columnHelper.accessor(value => state.accessor(value) as number, {
        id: `${pathStr}_${type.baseID}`,
        header: () => <TitledHeader
          className='min-w-2'
          text={type.baseID}
          title={columnTitle}
        />,
        size: services.showDataText ? 300 : 60,
        minSize: services.showDataText ? 300 : 60,
        maxSize: services.showDataText ? 300 : 60,
        cell: props => <span
          className={services.editElement ? 'cursor-pointer' : ''}
          onClick={services.editElement ? () => services.editElement!(elementPath(props.row.index)) : undefined}
        >
          {prepareValueString(
            props.getValue(), type,
            services.schema, services.basics, services.showDataText
          )}
        </span>
      })
    ];
    case TypeID.collection: return [
      columnHelper.accessor(value => state.accessor(value) as Value[], {
        id: `${pathStr}_card`,
        header: () => <TitledHeader
          className='min-w-4'
          text='ℬ'
          title={columnTitle}
        />,
        size: 60,
        minSize: 60,
        maxSize: 60,
        cell: props => <span
          className='font-math cursor-pointer'
          onClick={() => services.navigateValue(elementPath(props.row.index))}
        >
          {props.getValue().length}
        </span>
      }),
      columnHelper.accessor(value => state.accessor(value) as Value[], {
        id: `${pathStr}_stub`,
        header: '',
        size: 80,
        minSize: 80,
        maxSize: 80,
        cell: props => <span
          className='min-w-16 font-math cursor-pointer'
          onClick={() => services.navigateValue(elementPath(props.row.index))}
        >
          {valueStub(props.getValue())}
        </span>
      })
    ];
    case TypeID.tuple: {
      const components: ColumnDef<Value, unknown>[] = [];
      for (let i = 0; i < type.factors.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        components.push(...createColumnsInternal(
          type.factors[i],
          services,
          {
            singleton: state.singleton,
            path: makeValuePath([...state.path, i + 1]),
            accessor: value => ((state.accessor(value) as Value[])[i + 1])
          }
        ));
      }
      return components;
    }
  }
  return [];
}
