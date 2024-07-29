'use client';

import { useMemo } from 'react';

import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import AnimateFade from '@/components/wrap/AnimateFade';
import { IOperationSchema, OperationID } from '@/models/oss';

import PickMultiOperation from '../../components/select/PickMultiOperation';

interface TabArgumentsProps {
  oss: IOperationSchema;
  target: OperationID;
  inputs: OperationID[];
  setInputs: React.Dispatch<React.SetStateAction<OperationID[]>>;
}

function TabArguments({ oss, inputs, target, setInputs }: TabArgumentsProps) {
  const potentialCycle = useMemo(() => [target, ...oss.graph.expandAllOutputs([target])], [target, oss.graph]);
  const filtered = useMemo(
    () => oss.items.filter(item => !potentialCycle.includes(item.id)),
    [oss.items, potentialCycle]
  );
  return (
    <AnimateFade className='cc-column'>
      <FlexColumn>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <PickMultiOperation items={filtered} selected={inputs} setSelected={setInputs} rows={8} />
      </FlexColumn>
    </AnimateFade>
  );
}

export default TabArguments;
