'use client';

import clsx from 'clsx';

import FlexColumn from '@/components/ui/FlexColumn';
import AnimateFade from '@/components/wrap/AnimateFade';
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
  const { schema } = useOSS();
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
        modified={isModified}
        onSubmit={initiateSubmit}
        onDestroy={onDestroy}
        controller={controller}
      />
      <AnimateFade
        onKeyDown={handleInput}
        className={clsx('md:w-fit md:max-w-fit max-w-[32rem]', 'mx-auto pt-[1.9rem]', 'flex flex-col md:flex-row px-6')}
      >
        <FlexColumn className='px-3'>
          <FormOSS id={globals.library_item_editor} isModified={isModified} setIsModified={setIsModified} />
          <EditorLibraryItem item={schema} isModified={isModified} controller={controller} />
        </FlexColumn>

        {schema ? <OssStats stats={schema.stats} /> : null}
      </AnimateFade>
    </>
  );
}

export default EditorOssCard;
