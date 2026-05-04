'use client';

import { useTx } from '@/i18n';

import { useAuth } from '@/features/auth/backend/use-auth';

import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconAssistant, IconChat, IconTemplates } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { globalIDs } from '@/utils/constants';

import { urls } from '../urls';

import { NavigationButton } from './navigation-button';
import { useConceptNavigation } from './navigation-context';

export function MenuAI() {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();
  const { user } = useAuth();
  const showAIPrompt = useDialogsStore(state => state.showAIPrompt);

  function navigateTemplates(event: React.MouseEvent<Element>) {
    hideMenu();
    router.push({ path: urls.prompt_templates, newTab: event.ctrlKey || event.metaKey });
  }

  function handleCreatePrompt(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    hideMenu();
    showAIPrompt();
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='flex items-center justify-start relative h-full'>
      <NavigationButton
        title={tx('nav.ai.menuTitle')}
        hideTitle={isMenuOpen}
        aria-expanded={isMenuOpen}
        aria-controls={globalIDs.ai_dropdown}
        icon={<IconAssistant size='1.25rem' />}
        onClick={toggleMenu}
      />

      <Dropdown id={globalIDs.ai_dropdown} className='min-w-[12ch] max-w-48' stretchLeft isOpen={isMenuOpen}>
        <DropdownButton
          text={tx('nav.ai.prompt')}
          title={tx('nav.ai.promptTitle')}
          icon={<IconChat size='1rem' />}
          onClick={handleCreatePrompt}
        />
        <DropdownButton
          text={tx('semantic.term.templates')}
          title={user.id ? tx('nav.ai.templatesTitleAuth') : tx('nav.ai.templatesTitleAnon')}
          icon={<IconTemplates size='1rem' />}
          onClick={navigateTemplates}
          disabled={!user.id}
        />
      </Dropdown>
    </div>
  );
}
