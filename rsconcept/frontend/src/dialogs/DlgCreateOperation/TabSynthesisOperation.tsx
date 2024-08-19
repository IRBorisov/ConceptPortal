import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { IOperationSchema, OperationID } from '@/models/oss';

import PickMultiOperation from '../../components/select/PickMultiOperation';

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

      <FlexColumn>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <PickMultiOperation items={oss.items} selected={inputs} setSelected={setInputs} rows={6} />
      </FlexColumn>
    </AnimateFade>
  );
}

export default TabSynthesisOperation;
