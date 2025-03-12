'use client';

import { Handle, Position } from 'reactflow';

import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';

import { colorBgGraphNode } from '../../../../colors';
import { type IConstituenta } from '../../../../models/rsform';
import { useTermGraphStore } from '../../../../stores/term-graph';
import { useRSEdit } from '../../rsedit-context';

const DESCRIPTION_THRESHOLD = 15;
const LABEL_THRESHOLD = 3;

const FONT_SIZE_MAX = 14;
const FONT_SIZE_MED = 12;
const FONT_SIZE_MIN = 10;

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
  const { focusCst, setFocus: setFocusCst, navigateCst } = useRSEdit();
  const filter = useTermGraphStore(state => state.filter);
  const coloring = useTermGraphStore(state => state.coloring);
  const isFocused = focusCst === node.data;

  const label = node.data.alias;
  const description = !filter.noText ? node.data.term_resolved : '';

  function handleContextMenu(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
    event.preventDefault();
    setFocusCst(isFocused ? null : node.data);
  }

  function handleDoubleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    navigateCst(node.data.id);
  }

  return (
    <>
      <Handle type='target' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{
          backgroundColor: node.selected
            ? APP_COLORS.bgActiveSelection
            : isFocused
            ? APP_COLORS.bgPurple
            : colorBgGraphNode(node.data, coloring),
          fontSize: label.length > LABEL_THRESHOLD ? FONT_SIZE_MED : FONT_SIZE_MAX,
          borderWidth: isFocused ? '2px' : '0px',
          borderColor: isFocused ? APP_COLORS.bgSelected : 'transparent'
        }}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={describeCstNode(node.data)}
        data-tooltip-hidden={node.dragging}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
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
          onContextMenu={handleContextMenu}
          onDoubleClick={handleDoubleClick}
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
