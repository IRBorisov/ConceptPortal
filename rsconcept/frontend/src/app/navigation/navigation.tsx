'use client';

import clsx from 'clsx';

import { LibraryItemType } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuth } from '@/features/auth';

import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconLibrary2,
  IconManuals,
  IconNewItem2,
  IconOSS,
  IconRSForm,
  IconRSModel,
  IconSandbox
} from '@/components/icons';
import { useWindowSize } from '@/hooks/use-window-size';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';

import { urls } from '../urls';

import { CurrentTitle } from './current-title';
import { Logo } from './logo';
import { MenuAI } from './menu-ai';
import { MenuUser } from './menu-user';
import { NavLocaleSwitcher } from './nav-locale-switcher';
import { NavigationButton } from './navigation-button';
import { useConceptNavigation } from './navigation-context';
import { ToggleNavigation } from './toggle-navigation';

export function Navigation() {
  const tx = useTx();
  const { push } = useConceptNavigation();
  const { isAnonymous } = useAuth();
  const { isSmall } = useWindowSize();
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const activeDialog = useDialogsStore(state => state.active);

  const currentOSS = useAIStore(state => state.oss);
  const currentModel = useAIStore(state => state.model);
  const currentSchema = useAIStore(state => state.schema);
  const currentItem = currentOSS || currentModel || currentSchema;
  const {
    elementRef: createRef,
    isOpen: isCreateOpen,
    toggle: toggleCreate,
    hide: hideCreate,
    handleBlur: handleCreateBlur
  } = useDropdown();

  function navigateHome(event: React.MouseEvent<Element>) {
    push({ path: urls.home, newTab: event.ctrlKey || event.metaKey });
  }
  function navigateLibrary(event: React.MouseEvent<Element>) {
    push({ path: urls.library, newTab: event.ctrlKey || event.metaKey });
  }
  function navigateHelp(event: React.MouseEvent<Element>) {
    push({ path: urls.manuals, newTab: event.ctrlKey || event.metaKey });
  }
  function navigateCreateSchema(event: React.MouseEvent<Element>) {
    hideCreate();
    push({
      path: urls.create_item_by_type(LibraryItemType.RSFORM),
      newTab: event.ctrlKey || event.metaKey
    });
  }

  function navigateCreateModel(event: React.MouseEvent<Element>) {
    hideCreate();
    push({
      path: urls.create_item_by_type(LibraryItemType.RSMODEL),
      newTab: event.ctrlKey || event.metaKey
    });
  }

  function navigateCreateOSS(event: React.MouseEvent<Element>) {
    hideCreate();
    push({
      path: urls.create_item_by_type(LibraryItemType.OSS),
      newTab: event.ctrlKey || event.metaKey
    });
  }

  function navigateSandbox(event: React.MouseEvent<Element>) {
    push({ path: urls.sandbox, newTab: event.ctrlKey || event.metaKey });
  }

  return (
    <nav
      className='z-navigation sticky top-0 left-0 right-0 select-none bg-background/95 backdrop-blur-xl'
      inert={activeDialog !== null}
    >
      <ToggleNavigation />
      <div
        className={clsx(
          'relative isolate',
          'pl-2 sm:pr-4 h-12 flex gap-2 justify-between',
          'cc-shadow-border',
          'transition-[max-height,translate] ease-bezier duration-move',
          noNavigationAnimation ? '-translate-y-6 max-h-0' : 'max-h-12'
        )}
      >
        <div className='absolute top-0 w-full h-full overflow-hidden'>
          <div
            aria-hidden
            className={clsx(
              'absolute -left-8 -top-10 h-24 w-40',
              'rounded-full blur-3xl',
              'bg-accent-green/20 dark:bg-accent-green/60',
              'pointer-events-none '
            )}
          />
          <div
            aria-hidden
            className={clsx(
              'absolute right-8 -top-8 h-20 w-32',
              'rounded-full blur-3xl',
              'bg-accent-teal/15 dark:bg-accent-teal/60',
              'pointer-events-none '
            )}
          />
        </div>

        <div
          className='cc-fade-in relative z-10 flex items-center shrink-0'
          onClick={!isSmall ? navigateHome : undefined}
        >
          <Logo />
        </div>
        {currentItem ? <CurrentTitle itemType={currentItem.item_type} title={currentItem.title} /> : null}
        <div className='relative z-10 flex gap-2 items-center shrink-0'>
          {isAnonymous ? (
            <NavigationButton
              text={tx('nav.bar.sandbox', 'Sandbox')}
              title={tx('nav.bar.sandboxTitle', 'Demo environment for guests')}
              icon={<IconSandbox size='1.25rem' />}
              onClick={navigateSandbox}
            />
          ) : (
            <div ref={createRef} onBlur={handleCreateBlur} className='relative'>
              <NavigationButton
                text={tx('nav.bar.create', 'Create')}
                icon={<IconNewItem2 size='1.25rem' />}
                onClick={toggleCreate}
              />
              <Dropdown isOpen={isCreateOpen} margin='mt-2'>
                <DropdownButton
                  text={tx('nav.bar.createSchema', 'Conceptual schema')}
                  icon={<IconRSForm size='1rem' className='icon-green' />}
                  onClick={navigateCreateSchema}
                />
                <DropdownButton
                  text={tx('nav.bar.createModel', 'Conceptual model')}
                  icon={<IconRSModel size='1rem' className='text-accent-orange' />}
                  onClick={navigateCreateModel}
                />
                <DropdownButton
                  text={tx('nav.bar.createOss', 'Operational schema')}
                  icon={<IconOSS size='1rem' className='icon-primary' />}
                  onClick={navigateCreateOSS}
                />
              </Dropdown>
            </div>
          )}
          <NavigationButton
            text={tx('nav.bar.library', 'Library')}
            icon={<IconLibrary2 size='1.25rem' />}
            onClick={navigateLibrary}
          />
          <NavigationButton
            text={tx('nav.bar.help', 'Help')}
            icon={<IconManuals size='1.25rem' />}
            onClick={navigateHelp}
          />

          <MenuAI />
          <MenuUser />
          <NavLocaleSwitcher />
        </div>
      </div>
    </nav>
  );
}
