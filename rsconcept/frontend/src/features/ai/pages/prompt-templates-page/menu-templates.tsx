import { urls, useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { IconNewItem } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';

import { PromptTabID } from './templates-tabs';

export function MenuTemplates() {
  const router = useConceptNavigation();
  const showCreatePromptTemplate = useDialogsStore(state => state.showCreatePromptTemplate);

  function handleNewTemplate() {
    showCreatePromptTemplate({
      onCreate: data => router.push({ path: urls.prompt_template(data.id, PromptTabID.EDIT) })
    });
  }

  return (
    <div className='flex border-r-2 px-2'>
      <MiniButton
        noHover
        noPadding
        title='Новый шаблон'
        icon={<IconNewItem size='1.25rem' />}
        className='h-full text-muted-foreground hover:text-constructive cc-animate-color bg-transparent'
        onClick={handleNewTemplate}
      />
    </div>
  );
}
