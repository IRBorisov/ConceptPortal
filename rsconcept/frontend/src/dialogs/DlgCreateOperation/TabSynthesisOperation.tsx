'use client';

import { useEffect, useState } from 'react';

import SelectOperation from '@/components/select/SelectOperation';
import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { IOperation, IOperationSchema, OperationID } from '@/models/oss';
import { limits, patterns } from '@/utils/constants';

interface TabSynthesisOperationProps {
  oss: IOperationSchema;
  alias: string;
  setAlias: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  inputs: OperationID[];
  setInputs: React.Dispatch<React.SetStateAction<OperationID[]>>;
}

function TabSynthesisOperation({
  oss,
  alias,
  setAlias,
  title,
  setTitle,
  comment,
  setComment,
  inputs,
  setInputs
}: TabSynthesisOperationProps) {
  const [left, setLeft] = useState<IOperation | undefined>(undefined);
  const [right, setRight] = useState<IOperation | undefined>(undefined);

  console.log(inputs);

  useEffect(() => {
    const inputs: OperationID[] = [];
    if (left) {
      inputs.push(left.id);
    }
    if (right) {
      inputs.push(right.id);
    }
    setInputs(inputs);
  }, [setInputs, left, right]);

  return (
    <AnimateFade className='cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <div className='flex gap-6'>
        <TextInput
          id='operation_alias'
          label='Сокращение'
          className='w-[14rem]'
          pattern={patterns.library_alias}
          title={`не более ${limits.library_alias_len} символов`}
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />

        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          value={comment}
          onChange={event => setComment(event.target.value)}
        />
      </div>

      <div className='flex justify-between'>
        <FlexColumn>
          <Label text='Аргумент 1' />
          <SelectOperation items={oss.items} value={left} onSelectValue={setLeft} />
        </FlexColumn>
        <FlexColumn>
          <Label text='Аргумент 2' className='text-right' />
          <SelectOperation items={oss.items} value={right} onSelectValue={setRight} />
        </FlexColumn>
      </div>
    </AnimateFade>
  );
}

export default TabSynthesisOperation;
