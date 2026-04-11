import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import equal from 'fast-deep-equal';

import { type RSForm } from '@/features/rsform';
import { makeValuePath, TypeID, type Typification, type Value, type ValuePath } from '@/features/rslang';
import { testInvalid, valueStub } from '@/features/rslang/eval/value-api';
import { type EchelonCollection, IntegerT } from '@/features/rslang/semantic/typification';

import { MiniButton } from '@/components/control';
import { IconRemove } from '@/components/icons';
import { globalIDs } from '@/utils/constants';
import { truncateToLastWord, truncateToSymbol } from '@/utils/format';

import { type BasicsContext } from '../../models/rsmodel';
import { prepareValueString } from '../../models/rsmodel-api';
import { type ValueMatcher } from '../../models/value-matcher';

const HEADER_TRUNCATE = 35;
const VALUE_TRUNCATE = 45;
const VALUE_TRUNCATE_LONG = 80;

const columnHelper = createColumnHelper<Value>();

export interface ColumnServices {
  schema: RSForm;
  basics: BasicsContext;
  showDataText: boolean;
  matcher: ValueMatcher | null;
  indexMap: Map<number, number>;
  isSingleton: boolean;
  getColumnText: (path: ValuePath) => string;
  navigateValue: (path: ValuePath) => void;
  selectElement?: (path: ValuePath | null) => void;
  deleteElement?: (target: number) => void;
}

interface ColumnState {
  path: ValuePath;
  accessor: (value: Value) => Value;
}

export function createColumnsType(
  type: Typification,
  selectedPath: ValuePath | null,
  services: ColumnServices
): ReturnType<typeof columnHelper.accessor>[] {
  const state = {
    path: makeValuePath([]),
    accessor: (value: Value) => value
  };
  const columns = createColumnsInternal(
    services.isSingleton ? type : (type as EchelonCollection).base,
    selectedPath,
    services,
    state
  );
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
function createColumnsInternal(
  type: Typification,
  selectedPath: ValuePath | null,
  services: ColumnServices,
  state: ColumnState
): ReturnType<typeof columnHelper.accessor>[] {
  const pathStr = state.path.join('_');
  const headerPath = services.isSingleton ? state.path : makeValuePath([0, ...state.path]);
  const columnTitle = services.getColumnText(headerPath);
  const elementPath = (rowIndex: number) =>
    services.isSingleton ? state.path : makeValuePath([services.indexMap.get(rowIndex) ?? rowIndex, ...state.path]);
  switch (type.typeID) {
    case TypeID.integer:
      return [
        columnHelper.accessor(value => state.accessor(value) as number, {
          id: `B${pathStr}_Z`,
          header: () => <TitledHeader className='min-w-2 px-1' text='Z' title={columnTitle} />,
          size: 60,
          minSize: 60,
          maxSize: 60,
          cell: props => (
            <IntegerCell
              value={props.getValue()}
              services={services}
              isSelected={equal(elementPath(props.row.index), selectedPath)}
              path={elementPath(props.row.index)}
            />
          )
        })
      ];
    case TypeID.basic:
      return [
        columnHelper.accessor(value => state.accessor(value) as number, {
          id: `${pathStr}_${type.baseID}`,
          header: () => <TitledHeader className='min-w-2 px-1' text={type.baseID} title={columnTitle} />,
          size: services.showDataText ? 250 : 60,
          minSize: services.showDataText ? 250 : 60,
          maxSize: services.showDataText ? 250 : 60,
          cell: props => (
            <BasicCell
              value={props.getValue()}
              services={services}
              isSelected={equal(elementPath(props.row.index), selectedPath)}
              isInvalid={testInvalid(props.getValue())}
              type={type}
              path={elementPath(props.row.index)}
            />
          )
        })
      ];
    case TypeID.collection:
      return [
        columnHelper.accessor(value => state.accessor(value) as Value[], {
          id: `${pathStr}_card`,
          header: () => <TitledHeader className='w-4' text='ℬ' />,
          size: 60,
          minSize: 60,
          maxSize: 60,
          cell: props => (
            <div
              className='font-math cursor-pointer'
              onClick={() => services.navigateValue(elementPath(props.row.index))}
            >
              {props.getValue().length}
            </div>
          )
        }),
        columnHelper.accessor(value => state.accessor(value) as Value[], {
          id: `${pathStr}_stub`,
          header: () => <TitledHeader text='' title={columnTitle} />,
          size: 80,
          minSize: 80,
          maxSize: 80,
          cell: props => (
            <StubCell value={props.getValue()} services={services} path={elementPath(props.row.index)} type={type} />
          )
        })
      ];
    case TypeID.tuple: {
      const components: ColumnDef<Value, unknown>[] = [];
      for (let i = 0; i < type.factors.length; i++) {
        components.push(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          ...createColumnsInternal(type.factors[i], selectedPath, services, {
            path: makeValuePath([...state.path, i + 1]),
            accessor: value => (state.accessor(value) as Value[])[i + 1]
          })
        );
      }
      return components;
    }
  }
  return [];
}

function TitledHeader({ text, title, className }: { text: string; title?: string; className?: string }) {
  return (
    <div className={className} data-tooltip-id={!!title ? globalIDs.tooltip : undefined} data-tooltip-content={title}>
      {title
        ? truncateToSymbol(text && !title.startsWith(text) ? `[${text}] - ${title}` : title, HEADER_TRUNCATE)
        : text}
    </div>
  );
}

function IntegerCell({
  value,
  services,
  isSelected,
  isInvalid,
  path
}: {
  value: number;
  services: ColumnServices;
  isSelected: boolean;
  isInvalid?: boolean;
  path: ValuePath;
}) {
  const isMatch = services.matcher?.match(value, IntegerT) ?? false;
  return (
    <div
      className={clsx(
        'px-1 w-fit',
        services.selectElement && 'cursor-pointer',
        isSelected && 'bg-selected outline-2 outline-primary-border',
        !isSelected && isInvalid && 'bg-accent-orange50 outline-2 outline-accent-orange',
        !isSelected && isMatch && 'bg-accent-green50 outline-2 outline-accent-green'
      )}
      onClick={services.selectElement ? () => services.selectElement!(isSelected ? null : path) : undefined}
    >
      {value}
    </div>
  );
}

function BasicCell({
  value,
  type,
  services,
  isSelected,
  isInvalid,
  path
}: {
  value: number;
  type: Typification;
  services: ColumnServices;
  isSelected: boolean;
  isInvalid?: boolean;
  path: ValuePath;
}) {
  const text = prepareValueString(value, type, services.schema, services.basics, services.showDataText);
  const isSingleColumn = path.length === 0 || (path.length === 1 && !services.isSingleton);
  const needsTooltip = text.length > (isSingleColumn ? VALUE_TRUNCATE_LONG : VALUE_TRUNCATE);
  const isMatch = services.matcher?.match(value, type) ?? false;
  return (
    <div
      className={clsx(
        'px-1 w-fit truncate',
        isSingleColumn ? 'max-w-150' : 'max-w-68',
        services.selectElement && 'cursor-pointer',
        isSelected && 'bg-selected outline-2 outline-primary-border',
        !isSelected && isInvalid && 'bg-accent-orange50 outline-2 outline-accent-orange',
        !isSelected && isMatch && 'bg-accent-green50 outline-2 outline-accent-green'
      )}
      onClick={services.selectElement ? () => services.selectElement!(isSelected ? null : path) : undefined}
      data-tooltip-content={needsTooltip ? text : undefined}
      data-tooltip-id={needsTooltip ? globalIDs.tooltip : undefined}
    >
      {truncateToLastWord(text, isSingleColumn ? VALUE_TRUNCATE_LONG : VALUE_TRUNCATE)}
    </div>
  );
}

function StubCell({
  value,
  services,
  path,
  type
}: {
  value: Value;
  services: ColumnServices;
  type: Typification;
  path: ValuePath;
}) {
  const isInvalid = testInvalid(value);
  const isMatch = services.matcher?.match(value, type) ?? false;
  const text = valueStub(value);
  return (
    <div
      className={clsx(
        'w-18 font-math cursor-pointer',
        isInvalid && 'bg-accent-orange50 outline-2 outline-accent-orange',
        isMatch && 'bg-accent-green50 outline-2 outline-accent-green'
      )}
      onClick={() => services.navigateValue(path)}
    >
      {text}
    </div>
  );
}
