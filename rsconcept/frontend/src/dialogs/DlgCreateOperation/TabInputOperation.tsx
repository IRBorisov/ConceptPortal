import { IconReset } from '@/components/Icons';
import PickSchema from '@/components/select/PickSchema';
import Checkbox from '@/components/ui/Checkbox';
import FlexColumn from '@/components/ui/FlexColumn';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
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
  syncText: boolean;
  setSyncText: React.Dispatch<React.SetStateAction<boolean>>;
}

function TabInputOperation({
  alias,
  setAlias,
  title,
  setTitle,
  comment,
  setComment,
  attachedID,
  setAttachedID,
  syncText,
  setSyncText
}: TabInputOperationProps) {
  return (
    <AnimateFade className='cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        value={title}
        onChange={event => setTitle(event.target.value)}
        disabled={syncText && attachedID !== undefined}
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
            disabled={syncText && attachedID !== undefined}
          />
          <Checkbox
            value={syncText}
            setValue={setSyncText}
            label='Синхронизировать текст'
            title='Брать текст из концептуальной схемы'
          />
        </FlexColumn>

        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          value={comment}
          onChange={event => setComment(event.target.value)}
          disabled={syncText && attachedID !== undefined}
        />
      </div>

      <div className='flex gap-3 items-center'>
        <Label text='Загружаемая концептуальная схема' />
        <MiniButton
          title='Сбросить выбор схемы'
          noHover
          noPadding
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          onClick={() => setAttachedID(undefined)}
          disabled={attachedID == undefined}
        />
      </div>

      <PickSchema value={attachedID} onSelectValue={setAttachedID} rows={8} />
    </AnimateFade>
  );
}

export default TabInputOperation;
