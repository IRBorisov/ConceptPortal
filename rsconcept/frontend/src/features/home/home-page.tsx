'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';

import { urls } from '@/app/urls';
import { useAuth } from '@/features/auth';
import { HelpTopic } from '@/features/help/models/help-topic';

import {
  IconFormula,
  IconLibrary,
  IconManuals,
  IconNewItem2,
  IconOSS,
  IconRobot,
  IconRSForm,
  IconRSModel,
  IconSandbox2,
  IconUser2
} from '@/components/icons';
import { usePreferencesStore } from '@/stores/preferences';
import { resources } from '@/utils/constants';

import { CtaButton } from './components/cta-button';
import { FeatureTile } from './components/feature-tile';
import { LanguageToggle } from './components/language-toggle';
import { ThemeToggle } from './components/theme-toggle';

export function HomePage() {
  const tx = useTx();
  const { isAnonymous } = useAuth();
  const darkMode = usePreferencesStore(state => state.darkMode);

  return (
    <main
      className='relative isolate mx-auto h-full w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16'
      role='main'
      aria-label={tx('home.mainAria', 'Portal home page')}
      itemScope
      itemType='https://schema.org/WebPage'
    >
      <div className='fixed right-1 top-1 z-navigation flex gap-3'>
        <LanguageToggle />
        <ThemeToggle />
      </div>
      {/* SEO: Decorative gradients */}
      <div aria-hidden className='absolute pointer-events-none inset-0 z-bottom overflow-hidden'>
        <div
          className={clsx(
            'absolute -top-30 left-1/2 -translate-x-1/2',
            'h-120 w-[min(48rem,100vw)] rounded-full',
            'blur-3xl bg-accent-blue/25 dark:bg-accent-blue/40'
          )}
        />
        <div
          className={clsx(
            'absolute left-[6%] top-60',
            'h-56 w-56 rounded-full',
            'blur-3xl bg-accent-purple/35 dark:bg-accent-purple/35'
          )}
        />
        <div
          className={clsx(
            'absolute bottom-24 right-[8%]',
            'h-48 w-72 rounded-full',
            'blur-3xl bg-accent-teal/20 dark:bg-accent-teal/30'
          )}
        />
      </div>

      <header className='mx-auto max-w-2xl text-center select-none'>
        <img
          alt={
            darkMode
              ? tx('home.heroLogoAltDark', 'Concept Portal logo (dark mode)')
              : tx('home.heroLogoAltLight', 'Concept Portal logo')
          }
          src={!darkMode ? resources.logo : resources.logo_dark}
          className='mx-auto mb-8 h-11 w-auto opacity-95 dark:opacity-90'
          decoding='async'
          loading='eager'
        />
        {/* SEO: Hero copy as h1 */}
        <h1 className={clsx('hidden xs:block mx-auto max-w-xl', 'text-lg font-medium', 'leading-snug text-nowrap')}>
          {tx('home.heroLine1', 'Design complex systems: analysis and synthesis')}
          <br />
          {tx('home.heroLine2', 'Concepts, processes, data, decisions, documents')}
        </h1>

        <nav
          className='mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6'
          aria-label={tx('home.ctaNavAria', 'Primary actions on the home page')}
        >
          {isAnonymous ? (
            <>
              <CtaButton
                to={urls.sandbox}
                variant='primary'
                text={tx('home.try', 'Try it')}
                title={tx('home.tryTitle', 'Open the sandbox and explore the portal')}
                icon={<IconSandbox2 size='1.25rem' />}
              />
              <CtaButton
                to={urls.login}
                variant='default'
                text={tx('home.login', 'Sign in')}
                title={tx('home.loginTitle', 'Go to sign-in')}
                icon={<IconUser2 size='1.25rem' />}
              />
              <CtaButton
                to={urls.manuals}
                variant='default'
                text={tx('home.study', 'Learn')}
                title={tx('home.studyTitle', 'Open the manuals')}
                icon={<IconManuals size='1.25rem' />}
              />
            </>
          ) : (
            <>
              <CtaButton
                to={urls.sandbox}
                variant='default'
                text={tx('home.try', 'Try it')}
                title={tx('home.tryTitle', 'Open the sandbox and explore the portal')}
                icon={<IconSandbox2 size='1.25rem' />}
              />
              <CtaButton
                to={urls.create_item}
                variant='primary'
                text={tx('home.create', 'Create')}
                title={tx('home.createTitle', 'Create a new schema or model in the library')}
                icon={<IconNewItem2 size='1.25rem' />}
              />
              <CtaButton
                to={urls.manuals}
                variant='default'
                text={tx('home.study', 'Learn')}
                title={tx('home.studyTitle', 'Open the manuals')}
                icon={<IconManuals size='1.25rem' />}
              />
            </>
          )}
        </nav>
      </header>

      <section
        className='mt-8 xs:mt-16'
        aria-labelledby='home-features-heading'
        itemScope
        itemType='https://schema.org/ItemList'
      >
        <h2 id='home-features-heading' className='sr-only'>
          {tx('home.featuresHeading', 'Portal features')}
        </h2>
        <meta
          itemProp='name'
          content={tx('home.featuresMetaName', 'Portal features — model catalog and system design')}
        />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <FeatureTile
            to={urls.library}
            icon={<IconLibrary size='1.5rem' />}
            title={tx('home.feature.library.title', 'Library')}
            description={tx(
              'home.feature.library.desc',
              'Catalog of conceptual schemas and models. Editing, versioning, and access control. Flexible filtering and search'
            )}
            accentClass='bg-accent-green'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.RSLANG)}
            icon={<IconFormula size='1.5rem' />}
            title={tx('home.feature.rslang.title', 'Structure genus language')}
            description={tx(
              'home.feature.rslang.desc',
              'Formal logic. Structuring, correctness, and evaluation of concept definitions'
            )}
            accentClass='bg-accent-blue'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.ASSISTANT)}
            icon={<IconRobot size='1.5rem' />}
            title={tx('home.feature.assistant.title', 'AI assistant')}
            description={tx(
              'home.feature.assistant.desc',
              'AI prompt templates and hints to speed up modeling and domain analysis'
            )}
            accentClass='bg-accent-teal/70'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_SYSTEM)}
            icon={<IconRSForm size='1.5rem' />}
            title={tx('home.feature.rsform.title', 'Definition systems')}
            description={tx(
              'home.feature.rsform.desc',
              'Conceptual schema, linkage graph, and rigorous conceptual apparatus in complex domains'
            )}
            accentClass='bg-accent-purple'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_RSMODEL)}
            icon={<IconRSModel size='1.5rem' />}
            title={tx('home.feature.rsmodel.title', 'Conceptual models')}
            description={tx(
              'home.feature.rsmodel.desc',
              'Domain data sources, interpretation of definitions, and value computation'
            )}
            accentClass='bg-accent-orange'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_OSS)}
            icon={<IconOSS size='1.5rem' />}
            title={tx('home.feature.oss.title', 'Operational schemas')}
            description={tx(
              'home.feature.oss.desc',
              'Operations on conceptual schemas, subject-matter blocks, and cross-cutting changes'
            )}
            accentClass='bg-accent-green'
          />
        </div>
      </section>
    </main>
  );
}
