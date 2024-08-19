import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';

interface TabOperationProps {
  alias: string;
  setAlias: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
}

function TabOperation({ alias, setAlias, title, setTitle, comment, setComment }: TabOperationProps) {
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
    </AnimateFade>
  );
}

export default TabOperation;
