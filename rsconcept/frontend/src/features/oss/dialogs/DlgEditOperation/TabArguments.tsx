'use client';
import { FlexColumn } from '@/components/Container';
import { Label } from '@/components/Input';

import PickMultiOperation from '../../components/PickMultiOperation';
import { IOperationSchema, OperationID } from '../../models/oss';

interface TabArgumentsProps {
  oss: IOperationSchema;
  target: OperationID;
  inputs: OperationID[];
  setInputs: React.Dispatch<React.SetStateAction<OperationID[]>>;
}

function TabArguments({ oss, inputs, target, setInputs }: TabArgumentsProps) {
  const potentialCycle = [target, ...oss.graph.expandAllOutputs([target])];
  const filtered = oss.items.filter(item => !potentialCycle.includes(item.id));
  return (
    <div className='cc-fade-in cc-column'>
      <FlexColumn>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <PickMultiOperation items={filtered} value={inputs} onChange={setInputs} rows={8} />
      </FlexColumn>
    </div>
  );
}

export default TabArguments;
