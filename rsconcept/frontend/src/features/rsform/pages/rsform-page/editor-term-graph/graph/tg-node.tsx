'use client';

import { Handle, Position } from 'reactflow';
import clsx from 'clsx';

import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';

import { colorBgGraphNode } from '../../../../colors';
import { labelCstTypification } from '../../../../labels';
import { type TGNodeInternal } from '../../../../models/graph-layout';
import { type IConstituenta } from '../../../../models/rsform';
import { useTermGraphStore } from '../../../../stores/term-graph';

const DESCRIPTION_THRESHOLD = 15;
const LABEL_THRESHOLD = 3;

export function TGNode(node: TGNodeInternal) {
  const filter = useTermGraphStore(state => state.filter);
  const coloring = useTermGraphStore(state => state.coloring);

  const label = node.data.cst.alias;
  const description = !filter.noText ? node.data.cst.term_resolved : '';

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={clsx(
          'w-full h-full cursor-default flex items-center justify-center rounded-full',
          node.data.focused && 'border-[2px] border-selected',
          label.length > LABEL_THRESHOLD ? 'text-[12px]/[16px]' : 'text-[14px]/[20px]'
        )}
        style={{
          backgroundColor: node.selected
            ? APP_COLORS.bgActiveSelection
            : node.data.focused
            ? APP_COLORS.bgPurple
            : colorBgGraphNode(node.data.cst, coloring)
        }}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={describeCstNode(node.data.cst)}
        data-tooltip-hidden={node.dragging}
      >
        <div className='cc-node-label'>{label}</div>
      </div>
      <Handle type='source' position={Position.Bottom} className='opacity-0' />
      {description ? (
        <div
          className={clsx(
            'mt-[4px] w-[150px] px-[4px] text-center translate-x-[calc(-50%+20px)]',
            'pointer-events-none',
            description.length > DESCRIPTION_THRESHOLD ? 'text-[10px]/[12px]' : 'text-[12px]/[16px]'
          )}
        >
          <div className='absolute top-0 px-[4px] left-0 text-center w-full line-clamp-3 hover:line-clamp-none'>
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
