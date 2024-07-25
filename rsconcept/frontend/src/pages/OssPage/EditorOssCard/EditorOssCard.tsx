'use client';

import clsx from 'clsx';

import FlexColumn from '@/components/ui/FlexColumn';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useAuth } from '@/context/AuthContext';
import { useOSS } from '@/context/OssContext';
import EditorLibraryItem from '@/pages/RSFormPage/EditorRSFormCard/EditorLibraryItem';
import ToolbarRSFormCard from '@/pages/RSFormPage/EditorRSFormCard/ToolbarRSFormCard';
import { globals } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';
import FormOSS from './FormOSS';
import OssStats from './OssStats';

interface EditorOssCardProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
  onDestroy: () => void;
}

function EditorOssCard({ isModified, onDestroy, setIsModified }: EditorOssCardProps) {
  const { schema, isSubscribed } = useOSS();
  const { user } = useAuth();
  const controller = useOssEdit();

  function initiateSubmit() {
    const element = document.getElementById(globals.library_item_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      if (isModified) {
        initiateSubmit();
      }
      event.preventDefault();
    }
  }

  return (
    <>
      <ToolbarRSFormCard
        subscribed={isSubscribed}
        modified={isModified}
        anonymous={!user}
        onSubmit={initiateSubmit}
        onDestroy={onDestroy}
        controller={controller}
      />
      <AnimateFade onKeyDown={handleInput} className={clsx('sm:w-fit mx-auto', 'flex flex-col sm:flex-row px-6')}>
        <FlexColumn className='px-3'>
          <FormOSS id={globals.library_item_editor} isModified={isModified} setIsModified={setIsModified} />
          <EditorLibraryItem item={schema} isModified={isModified} controller={controller} />
        </FlexColumn>

        <OssStats stats={schema?.stats} />
      </AnimateFade>
    </>
  );
}

export default EditorOssCard;
