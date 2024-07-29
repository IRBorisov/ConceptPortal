import Checkbox from '@/components/ui/Checkbox';
import FlexColumn from '@/components/ui/FlexColumn';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { limits, patterns } from '@/utils/constants';

interface TabOperationProps {
  alias: string;
  setAlias: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  syncText: boolean;
  setSyncText: React.Dispatch<React.SetStateAction<boolean>>;
}

function TabOperation({
  alias,
  setAlias,
  title,
  setTitle,
  comment,
  setComment,
  syncText,
  setSyncText
}: TabOperationProps) {
  return (
    <AnimateFade className='cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <div className='flex gap-6'>
        <FlexColumn>
          <TextInput
            id='operation_alias'
            label='Сокращение'
            className='w-[14rem]'
            pattern={patterns.library_alias}
            title={`не более ${limits.library_alias_len} символов`}
            value={alias}
            onChange={event => setAlias(event.target.value)}
          />
          <Checkbox
            value={syncText}
            setValue={setSyncText}
            label='Синхронизировать текст'
            titleHtml='Загрузить текстовые поля<br/> из концептуальной схемы'
          />
        </FlexColumn>

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
