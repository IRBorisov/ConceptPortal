'use client';

import { NodeType, type OperationSchema, type OssItem } from '@/domain/library';

import { Label } from '@/components/input';

import { PickContents } from '../../components/pick-contents';

interface TabBlockChildrenProps {
  oss: OperationSchema;
  parent: number | null;
  blocks: number[];
  operations: number[];
  onChangeBlocks: (childrenBlocks: number[]) => void;
  onChangeOperations: (childrenOperations: number[]) => void;
}

export function TabBlockChildren({
  oss,
  parent,
  blocks,
  operations,
  onChangeBlocks,
  onChangeOperations
}: TabBlockChildrenProps) {
  const parentItem = parent ? oss.blockByID.get(parent) : null;
  const internalBlocks = parentItem
    ? oss.hierarchy
        .expandAllInputs([parentItem.nodeID])
        .map(id => oss.itemByNodeID.get(id))
        .filter(item => item !== null && item?.nodeType === NodeType.BLOCK)
    : [];

  const exclude = parentItem ? [parentItem, ...internalBlocks] : [];

  const value = [...blocks.map(id => oss.blockByID.get(id)!), ...operations.map(id => oss.operationByID.get(id)!)];

  function handleChangeSelected(newValue: OssItem[]) {
    onChangeBlocks(newValue.filter(item => item.nodeType === NodeType.BLOCK).map(item => item.id));
    onChangeOperations(newValue.filter(item => item.nodeType === NodeType.OPERATION).map(item => item.id));
  }

  return (
    <div className='cc-fade-in cc-column -mt-5'>
      <Label text={`Выбор содержания: [ ${value.length} ]`} />
      <PickContents
        schema={oss}
        exclude={exclude}
        value={value}
        onChange={newValue => handleChangeSelected(newValue)}
        rows={10}
      />
    </div>
  );
}
