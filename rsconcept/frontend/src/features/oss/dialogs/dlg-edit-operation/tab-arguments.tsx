'use client';

import { type OperationInput, type OperationSchema, type OperationSynthesis } from '@/domain/library';

import { Label } from '@/components/input';

import { PickMultiOperation } from '../../components/pick-multi-operation';

interface TabArgumentsProps {
  oss: OperationSchema;
  target: OperationInput | OperationSynthesis;
  args: number[];
  onChangeArguments: (newValue: number[]) => void;
  onResetSubstitutions: () => void;
}

export function TabArguments({ oss, target, args, onChangeArguments, onResetSubstitutions }: TabArgumentsProps) {
  const replicas = oss.replicas
    .filter(item => args.includes(item.original) || item.original === target.id)
    .map(item => item.replica)
    .concat(oss.replicas.filter(item => args.includes(item.replica)).map(item => item.original));
  const potentialCycle = [target.id, ...replicas, ...oss.graph.expandAllOutputs([target.id])];
  const filtered = oss.operations.filter(item => !potentialCycle.includes(item.id));

  function handleChangeArguments(newValue: number[]) {
    if (args.some(id => !newValue.includes(id))) {
      onResetSubstitutions();
    }
    onChangeArguments(newValue);
  }

  return (
    <div className='cc-fade-in cc-column'>
      <>
        <Label text={`Выбор аргументов: [ ${args.length} ]`} />
        <PickMultiOperation items={filtered} value={args} onChange={handleChangeArguments} rows={8} />
      </>
    </div>
  );
}
