import { TextArea, TextInput } from '@/components/ui/Input';

interface TabOperationProps {
  alias: string;
  onChangeAlias: (newValue: string) => void;
  title: string;
  onChangeTitle: (newValue: string) => void;
  comment: string;
  onChangeComment: (newValue: string) => void;
}

function TabOperation({ alias, onChangeAlias, title, onChangeTitle, comment, onChangeComment }: TabOperationProps) {
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
    </div>
  );
}

export default TabOperation;
