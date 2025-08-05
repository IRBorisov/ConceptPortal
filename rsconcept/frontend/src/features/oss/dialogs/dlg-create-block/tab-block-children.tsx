'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { Label } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateBlockDTO } from '../../backend/types';
import { PickContents } from '../../components/pick-contents';
import { type IOssItem, NodeType } from '../../models/oss';

import { type DlgCreateBlockProps } from './dlg-create-block';

export function TabBlockChildren() {
  const { setValue, control } = useFormContext<ICreateBlockDTO>();
  const { manager } = useDialogsStore(state => state.props as DlgCreateBlockProps);
  const parent = useWatch({ control, name: 'item_data.parent' });
  const children_blocks = useWatch({ control, name: 'children_blocks' });
  const children_operations = useWatch({ control, name: 'children_operations' });

  const parentItem = parent ? manager.oss.blockByID.get(parent) : null;
  const internalBlocks = parentItem
    ? manager.oss.hierarchy
        .expandAllInputs([parentItem.nodeID])
        .map(id => manager.oss.itemByNodeID.get(id))
        .filter(item => item !== null && item?.nodeType === NodeType.BLOCK)
    : [];

  const exclude = parentItem ? [parentItem, ...internalBlocks] : [];

  const value = [
    ...children_blocks.map(id => manager.oss.blockByID.get(id)!),
    ...children_operations.map(id => manager.oss.operationByID.get(id)!)
  ];

  function handleChangeSelected(newValue: IOssItem[]) {
    setValue(
      'children_blocks',
      newValue.filter(item => item.nodeType === NodeType.BLOCK).map(item => item.id),
      { shouldValidate: true }
    );
    setValue(
      'children_operations',
      newValue.filter(item => item.nodeType === NodeType.OPERATION).map(item => item.id),
      { shouldValidate: true }
    );
  }

  return (
    <div className='cc-fade-in cc-column'>
      <Label text={`Выбор содержания: [ ${value.length} ]`} />
      <PickContents
        schema={manager.oss}
        exclude={exclude}
        value={value}
        onChange={newValue => handleChangeSelected(newValue)}
        rows={10}
      />
    </div>
  );
}
