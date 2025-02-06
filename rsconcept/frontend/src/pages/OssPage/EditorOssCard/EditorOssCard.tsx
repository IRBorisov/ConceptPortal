'use client';

import clsx from 'clsx';

import FlexColumn from '@/components/ui/FlexColumn';
import EditorLibraryItem from '@/pages/RSFormPage/EditorRSFormCard/EditorLibraryItem';
import ToolbarRSFormCard from '@/pages/RSFormPage/EditorRSFormCard/ToolbarRSFormCard';
import { useModificationStore } from '@/stores/modification';
import { globals } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';
import FormOSS from './FormOSS';
import OssStats from './OssStats';

function EditorOssCard() {
  const controller = useOssEdit();
  const { isModified } = useModificationStore();

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
      <ToolbarRSFormCard onSubmit={initiateSubmit} controller={controller} />
      <div
        onKeyDown={handleInput}
        className={clsx(
          'cc-fade-in',
          'md:w-fit md:max-w-fit max-w-[32rem]',
          'mx-auto pt-[1.9rem]',
          'flex flex-row flex-wrap px-6'
        )}
      >
        <FlexColumn className='px-3'>
          <FormOSS />
          <EditorLibraryItem controller={controller} />
        </FlexColumn>

        <OssStats stats={controller.schema.stats} />
      </div>
    </>
  );
}

export default EditorOssCard;
