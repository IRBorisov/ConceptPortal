import PickSchema from '@/components/select/PickSchema';
import Label from '@/components/ui/Label';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { LibraryItemID } from '@/models/library';
import { limits, patterns } from '@/utils/constants';

interface TabInputOperationProps {
  alias: string;
  setAlias: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  attachedID: LibraryItemID | undefined;
  setAttachedID: React.Dispatch<React.SetStateAction<LibraryItemID | undefined>>;
}

function TabInputOperation({
  alias,
  setAlias,
  title,
  setTitle,
  comment,
  setComment,
  attachedID,
  setAttachedID
}: TabInputOperationProps) {
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

      <Label text='Загружаемая концептуальная схема' />
      <PickSchema value={attachedID} onSelectValue={setAttachedID} rows={8} />
    </AnimateFade>
  );
}

export default TabInputOperation;
