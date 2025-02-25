'use client';

import { Handle, Position } from 'reactflow';

import { type IConstituenta } from '@/features/rsform/models/rsform';
import { useTermGraphStore } from '@/features/rsform/stores/termGraph';

import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';

const DESCRIPTION_THRESHOLD = 15;
const LABEL_THRESHOLD = 3;

const FONT_SIZE_MAX = 14;
const FONT_SIZE_MED = 12;
const FONT_SIZE_MIN = 10;

export interface TGNodeData {
  fill: string;
  cst: IConstituenta;
}

/**
 * Represents graph AST node internal data.
 */
interface TGNodeInternal {
  id: string;
  data: TGNodeData;
  selected: boolean;
  dragging: boolean;
  xPos: number;
  yPos: number;
}

export function TGNode(node: TGNodeInternal) {
  const filter = useTermGraphStore(state => state.filter);
  const label = node.data.cst.alias;
  const description = !filter.noText ? node.data.cst.term_resolved : '';

  return (
    <>
      <Handle type='target' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{
          backgroundColor: !node.selected ? node.data.fill : APP_COLORS.bgActiveSelection,
          fontSize: label.length > LABEL_THRESHOLD ? FONT_SIZE_MED : FONT_SIZE_MAX
        }}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={describeCstNode(node.data.cst)}
      >
        <div
          style={{
            fontWeight: 600,
            WebkitTextStrokeWidth: '0.6px',
            WebkitTextStrokeColor: APP_COLORS.bgDefault
          }}
        >
          {label}
        </div>
      </div>
      <Handle type='source' position={Position.Bottom} style={{ opacity: 0 }} />
      {description ? (
        <div
          className='mt-1 w-[150px] px-1 text-center translate-x-[calc(-50%+20px)]'
          style={{
            fontSize: description.length > DESCRIPTION_THRESHOLD ? FONT_SIZE_MIN : FONT_SIZE_MED
          }}
        >
          <div className='absolute top-0 px-1 left-0 text-center w-full line-clamp-3 hover:line-clamp-none'>
            {description}
          </div>
          <div
            aria-hidden='true'
            className='line-clamp-3 hover:line-clamp-none'
            style={{
              WebkitTextStrokeWidth: '3px',
              WebkitTextStrokeColor: APP_COLORS.bgDefault
            }}
          >
            {description}
          </div>
        </div>
      ) : null}
    </>
  );
}

// ====== INTERNAL ======
function describeCstNode(cst: IConstituenta) {
  return `${cst.alias}: ${cst.term_resolved}</br>Типизация: ${cst.parse.typification}`;
}
