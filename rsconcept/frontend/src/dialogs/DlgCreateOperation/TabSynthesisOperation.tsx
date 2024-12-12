import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { IOperationSchema, OperationID } from '@/models/oss';

import PickMultiOperation from '../../components/select/PickMultiOperation';

interface TabSynthesisOperationProps {
  oss: IOperationSchema;
  alias: string;
  onChangeAlias: (newValue: string) => void;
  title: string;
  onChangeTitle: (newValue: string) => void;
  comment: string;
  onChangeComment: (newValue: string) => void;
  inputs: OperationID[];
  setInputs: React.Dispatch<React.SetStateAction<OperationID[]>>;
}

function TabSynthesisOperation({
  oss,
  alias,
  onChangeAlias,
  title,
  onChangeTitle,
  comment,
  onChangeComment,
  inputs,
  setInputs
}: TabSynthesisOperationProps) {
  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        value={title}
        onChange={event => onChangeTitle(event.target.value)}
      />
      <div className='flex gap-6'>
        <TextInput
          id='operation_alias'
          label='Сокращение'
          className='w-[16rem]'
          value={alias}
          onChange={event => onChangeAlias(event.target.value)}
        />

        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          value={comment}
          onChange={event => onChangeComment(event.target.value)}
        />
      </div>

      <FlexColumn>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <PickMultiOperation items={oss.items} selected={inputs} setSelected={setInputs} rows={6} />
      </FlexColumn>
    </div>
  );
}

export default TabSynthesisOperation;
