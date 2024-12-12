'use client';

import { useMemo } from 'react';

import PickMultiOperation from '@/components/select/PickMultiOperation';
import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import { IOperationSchema, OperationID } from '@/models/oss';

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
    <div className='cc-fade-in cc-column'>
      <FlexColumn>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <PickMultiOperation items={filtered} selected={inputs} setSelected={setInputs} rows={8} />
      </FlexColumn>
    </div>
  );
}

export default TabArguments;
