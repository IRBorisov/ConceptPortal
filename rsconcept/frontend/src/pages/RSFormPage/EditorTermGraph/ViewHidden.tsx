'use client';

import { useCallback, useMemo } from 'react';

import ConstituentaTooltip from '@/components/Help/ConstituentaTooltip';
import { useConceptTheme } from '@/context/ThemeContext';
import { GraphColoringScheme } from '@/models/miscelanious';
import { IRSForm } from '@/models/rsform';
import { colorbgGraphNode } from '@/utils/color';
import { prefixes } from '@/utils/constants';

interface ViewHiddenProps {
  items: number[]
  selected: number[]
  schema: IRSForm
  coloringScheme: GraphColoringScheme

  toggleSelection: (cstID: number) => void
  onEdit: (cstID: number) => void
}

function ViewHidden({
  items,
  selected, toggleSelection,
  schema, coloringScheme,
  onEdit
} : ViewHiddenProps) {
  const { colors, noNavigation } = useConceptTheme();

  const dismissedHeight = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 28rem - 4px)'
    : 'calc(100vh - 22.2rem - 4px)';
  }, [noNavigation]);

  const dismissedStyle = useCallback(
  (cstID: number) => {
    return selected.includes(cstID) ? {outlineWidth: '2px', outlineStyle: 'solid'}: {};
  }, [selected]);

  if (items.length <= 0) {
    return null;
  }
  return (
  <div className='flex flex-col text-sm ml-2 border clr-app w-[12.5rem]'>
    <p className='mt-2 text-center'><b>Скрытые конституенты</b></p>
    <div className='flex flex-wrap justify-center gap-2 py-2 overflow-y-auto' style={{ maxHeight: dismissedHeight }}>
    {items.map(
    (cstID) => {
      const cst = schema.items.find(cst => cst.id === cstID)!;
      const adjustedColoring = coloringScheme === 'none' ? 'status' : coloringScheme;
      const id = `${prefixes.cst_hidden_list}${cst.alias}`;
      return (
      <div key={`wrap-${id}`}>
        <div key={id} id={id}
          className='w-fit min-w-[3rem] rounded-md text-center cursor-pointer select-none'
          style={{
            backgroundColor: colorbgGraphNode(cst, adjustedColoring, colors),
            ...dismissedStyle(cstID)
          }}
          onClick={() => toggleSelection(cstID)}
          onDoubleClick={() => onEdit(cstID)}
        >
          {cst.alias}
        </div>
        <ConstituentaTooltip
          data={cst}
          anchor={`#${id}`} />
      </div>);
    })}
    </div>
  </div>);
}

export default ViewHidden;