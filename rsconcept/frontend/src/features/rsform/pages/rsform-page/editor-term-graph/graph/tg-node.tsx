'use client';

import { Handle, Position } from 'reactflow';
import clsx from 'clsx';

import { labelCstTypification } from '@/features/rsform/labels';

import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';

import { colorBgGraphNode } from '../../../../colors';
import { type IConstituenta } from '../../../../models/rsform';
import { useTermGraphStore } from '../../../../stores/term-graph';
import { useRSEdit } from '../../rsedit-context';

const DESCRIPTION_THRESHOLD = 15;
const LABEL_THRESHOLD = 3;

/**
 * Represents graph AST node internal data.
 */
interface TGNodeInternal {
  id: string;
  data: IConstituenta;
  selected: boolean;
  dragging: boolean;
  xPos: number;
  yPos: number;
}

export function TGNode(node: TGNodeInternal) {
  const { focusCst, setFocus, navigateCst } = useRSEdit();
  const filter = useTermGraphStore(state => state.filter);
  const coloring = useTermGraphStore(state => state.coloring);
  const isFocused = focusCst?.id === node.data.id;

  const label = node.data.alias;
  const description = !filter.noText ? node.data.term_resolved : '';

  function handleContextMenu(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
    event.preventDefault();
    setFocus(isFocused ? null : node.data);
  }

  function handleDoubleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    navigateCst(node.data.id);
  }

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={clsx(
          'w-full h-full cursor-default flex items-center justify-center rounded-full',
          isFocused && 'border-2 border-selected',
          label.length > LABEL_THRESHOLD ? 'text-[12px]/[16px]' : 'text-[14px]/[20px]'
        )}
        style={{
          backgroundColor: node.selected
            ? APP_COLORS.bgActiveSelection
            : isFocused
            ? APP_COLORS.bgPurple
            : colorBgGraphNode(node.data, coloring)
        }}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={describeCstNode(node.data)}
        data-tooltip-hidden={node.dragging}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        <div className='cc-node-label'>{label}</div>
      </div>
      <Handle type='source' position={Position.Bottom} className='opacity-0' />
      {description ? (
        <div
          className={clsx(
            'mt-1 w-[150px] px-1 text-center translate-x-[calc(-50%+20px)]',
            description.length > DESCRIPTION_THRESHOLD ? 'text-[10px]/[12px]' : 'text-[12px]/[16px]'
          )}
          onContextMenu={handleContextMenu}
          onDoubleClick={handleDoubleClick}
        >
          <div className='absolute top-0 px-1 left-0 text-center w-full line-clamp-3 hover:line-clamp-none'>
            {description}
          </div>
          <div aria-hidden className='line-clamp-3 hover:line-clamp-none cc-text-outline'>
            {description}
          </div>
        </div>
      ) : null}
    </>
  );
}

// ====== INTERNAL ======
function describeCstNode(cst: IConstituenta) {
  return `${cst.alias}: ${cst.term_resolved}</br>Типизация: ${labelCstTypification(cst)}`;
}
