'use client';

import clsx from 'clsx';

import { urls } from '@/app/urls';
import { useAuth } from '@/features/auth';
import { HelpTopic } from '@/features/help/models/help-topic';

import {
  IconFormula,
  IconLibrary,
  IconLogin,
  IconManuals,
  IconNewItem2,
  IconOSS,
  IconRobot,
  IconRSForm,
  IconRSModel,
  IconSandbox
} from '@/components/icons';
import { usePreferencesStore } from '@/stores/preferences';
import { resources } from '@/utils/constants';

import { CtaButton } from './components/cta-button';
import { FeatureTile } from './components/feature-tile';

export function HomePage() {
  const { isAnonymous } = useAuth();
  const darkMode = usePreferencesStore(state => state.darkMode);

  return (
    <main
      className='relative isolate mx-auto h-full w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16'
      role='main'
      aria-label='Главная страница портала'
      itemScope
      itemType='https://schema.org/WebPage'
    >
      {/* SEO: Decorative gradients */}
      <div aria-hidden className='absolute pointer-events-none inset-0 z-bottom overflow-hidden'>
        <div
          className={clsx(
            'absolute -top-30 left-1/2 -translate-x-1/2',
            'h-120 w-[min(48rem,100vw)] rounded-full',
            'blur-3xl bg-accent-blue/25 dark:bg-accent-blue/40',
          )}
        />
        <div
          className={clsx(
            'absolute left-[6%] top-60',
            'h-56 w-56 rounded-full',
            'blur-3xl bg-accent-purple/35 dark:bg-accent-purple/35',
          )}
        />
        <div
          className={clsx(
            'absolute bottom-24 right-[8%]',
            'h-48 w-72 rounded-full',
            'blur-3xl bg-accent-teal/20 dark:bg-accent-teal/30',
          )}
        />
      </div>

      <header className='mx-auto max-w-2xl text-center select-none'>
        <img
          alt={darkMode ? 'Логотип Концепт Портал (темный режим)' : 'Логотип Концепт Портал'}
          src={!darkMode ? resources.logo : resources.logo_dark}
          className='mx-auto mb-8 h-11 w-auto opacity-95 dark:opacity-90'
          decoding='async'
          loading='eager'
        />
        {/* SEO: Hero copy as h1 */}
        <h1 className={clsx(
          'hidden xs:block mx-auto max-w-xl',
          'text-lg font-medium',
          'leading-snug text-nowrap'
        )}>
          Проектируйте сложные системы: Анализ и Синтез<br />Понятия, процессы, данные, решения, документы
        </h1>

        <nav
          className='mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6'
          aria-label='Основные действия на главной странице'
        >
          {isAnonymous ? (
            <>
              <CtaButton
                to={urls.sandbox}
                variant='primary'
                text='Попробовать'
                title='Открыть песочницу и оценить Портал'
                icon={<IconSandbox size='1.25rem' />}
              />
              <CtaButton
                to={urls.login}
                variant='default'
                text='Войти'
                title='Перейти к авторизации'
                icon={<IconLogin size='1.25rem' />}
              />
              <CtaButton
                to={urls.manuals}
                variant='default'
                text='Изучить'
                title='Открыть руководства'
                icon={<IconManuals size='1.25rem' />}
              />
            </>
          ) : (
            <>
              <CtaButton
                to={urls.sandbox}
                variant='default'
                text='Попробовать'
                title='Открыть песочницу и оценить Портал'
                icon={<IconSandbox size='1.25rem' />}
              />
              <CtaButton
                to={urls.create_item}
                variant='primary'
                text='Создать'
                title='Создать новую схему или модель в библиотеке'
                icon={<IconNewItem2 size='1.25rem' />}
              />
              <CtaButton
                to={urls.manuals}
                variant='default'
                text='Изучить'
                title='Открыть руководства'
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
        <meta itemProp='name' content='Возможности портала - Каталог моделей, анализа и проектирования систем' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <FeatureTile
            to={urls.library}
            icon={<IconLibrary size='1.5rem' />}
            title='Библиотека'
            description='Каталог понятийных схем и моделей. Редактирование, версионирование и доступы. Гибкая фильтрация и поиск'
            accentClass='bg-accent-green'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.RSLANG)}
            icon={<IconFormula size='1.5rem' />}
            title='Язык родов структур'
            description='Формальная логика. Структурность, корректность и вычисление значений определений понятий'
            accentClass='bg-accent-blue'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.ASSISTANT)}
            icon={<IconRobot size='1.5rem' />}
            title='ИИ-помощник'
            description='ИИ шаблоны запросов и подсказки для ускорения моделирования и анализа предметных областей'
            accentClass='bg-accent-teal/70'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_SYSTEM)}
            icon={<IconRSForm size='1.5rem' />}
            title='Системы определений'
            description='Концептуальная схема, граф вязей, строгий понятийный аппарат в сложных предметных областях'
            accentClass='bg-accent-purple'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_RSMODEL)}
            icon={<IconRSModel size='1.5rem' />}
            title='Концептуальные модели'
            description='Предметные источники данных, интерпретация определений и вычисление значений'
            accentClass='bg-accent-orange'

          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_OSS)}
            icon={<IconOSS size='1.5rem' />}
            title='Операционные схемы'
            description='Операции над концептуальными схемами, блоки предметного содержания и сквозные изменения'
            accentClass='bg-accent-green'
          />
        </div>
      </section>
    </main >
  );
}
