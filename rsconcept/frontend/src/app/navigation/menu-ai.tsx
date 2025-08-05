'use client';

import { useAuth } from '@/features/auth/backend/use-auth';

import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconAssistant, IconChat, IconTemplates } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { globalIDs } from '@/utils/constants';

import { urls } from '../urls';

import { NavigationButton } from './navigation-button';
import { useConceptNavigation } from './navigation-context';

export function MenuAI() {
  const router = useConceptNavigation();
  const menu = useDropdown();
  const { user } = useAuth();
  const showAIPrompt = useDialogsStore(state => state.showAIPrompt);

  function navigateTemplates(event: React.MouseEvent<Element>) {
    menu.hide();
    router.push({ path: urls.prompt_templates, newTab: event.ctrlKey || event.metaKey });
  }

  function handleCreatePrompt(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    menu.hide();
    showAIPrompt();
  }

  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className='flex items-center justify-start relative h-full'>
      <NavigationButton
        title='ИИ помощник' //
        hideTitle={menu.isOpen}
        aria-expanded={menu.isOpen}
        aria-controls={globalIDs.ai_dropdown}
        icon={<IconAssistant size='1.5rem' />}
        onClick={menu.toggle}
      />

      <Dropdown id={globalIDs.ai_dropdown} className='min-w-[12ch] max-w-48' stretchLeft isOpen={menu.isOpen}>
        <DropdownButton
          text='Запрос'
          title='Создать запрос'
          icon={<IconChat size='1rem' />}
          onClick={handleCreatePrompt}
        />
        <DropdownButton
          text='Шаблоны'
          title={user?.is_staff ? 'Шаблоны запросов' : 'Доступно только зарегистрированным пользователям'}
          icon={<IconTemplates size='1rem' />}
          onClick={navigateTemplates}
          disabled={!user?.is_staff}
        />
      </Dropdown>
    </div>
  );
}
