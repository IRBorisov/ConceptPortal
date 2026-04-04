'use client';

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
    <div
      className='relative isolate mx-auto h-full w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 sm:pt-6'
      role='region'
      aria-label='Главная страница портала'
    >
      <div aria-hidden className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute -top-24 left-1/2 h-88 w-[min(48rem,100vw)] -translate-x-1/2 rounded-full bg-accent-blue/25 blur-3xl dark:bg-accent-blue/40' />
        <div className='absolute left-[6%] top-46 h-56 w-56 rounded-full bg-accent-purple/35 blur-3xl dark:bg-accent-purple/35' />
        <div className='absolute bottom-24 right-[8%] h-48 w-72 rounded-full bg-accent-teal/20 blur-3xl dark:bg-accent-teal/30' />
      </div>

      <header className='mx-auto max-w-2xl text-center select-none'>
        <img
          alt=''
          src={!darkMode ? resources.logo : resources.logo_dark}
          className='mx-auto mb-6 h-11 w-auto opacity-95 dark:opacity-90'
          decoding='async'
        />
        <p className='mx-auto max-w-xl text-pretty text-base leading-snug text-foreground sm:text-lg'>
          Проектируем сложные системы: Анализ и Синтез<br></br>Понятия, процессы, данные, решения, документы
        </p>

        <div className='mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-3.5'>
          {isAnonymous ? (
            <>
              <CtaButton
                to={urls.sandbox}
                variant='sandbox'
                text='Попробовать'
                tooltip='Открыть песочницу и быстро посмотреть возможности портала'
                icon={<IconSandbox size='1.125rem' />}
              />
              <CtaButton
                to={urls.login}
                variant='login'
                text='Войти'
                tooltip='Перейти к авторизации и открыть рабочее пространство'
                icon={<IconLogin size='1.125rem' />}
              />
              <CtaButton
                to={urls.manuals}
                variant='manuals'
                text='Изучить'
                tooltip='Открыть руководства, примеры и описание основных разделов'
                icon={<IconManuals size='1.125rem' />}
              />
            </>
          ) : (
            <>
              <CtaButton
                to={urls.sandbox}
                variant='sandbox'
                text='Попробовать'
                tooltip='Открыть песочницу и протестировать идеи без лишних шагов'
                icon={<IconSandbox size='1.125rem' />}
              />
              <CtaButton
                to={urls.create_item}
                variant='create'
                text='Создать'
                tooltip='Создать новую схему или модель в библиотеке'
                icon={<IconNewItem2 size='1.125rem' />}
              />
              <CtaButton
                to={urls.manuals}
                variant='manuals'
                text='Изучить'
                tooltip='Перейти к руководствам и справочным материалам'
                icon={<IconManuals size='1.125rem' />}
              />
            </>
          )}
        </div>
      </header>

      <section className='mt-16' aria-labelledby='home-features-heading'>
        <h2 id='home-features-heading' className='sr-only'>
          Возможности портала
        </h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <FeatureTile
            to={isAnonymous ? urls.login : urls.library}
            icon={<IconLibrary className='h-6 w-6' />}
            title='Библиотека'
            description='Каталог понятийных схем и моделей. Редактирование, версионирование и доступы. Гибкая фильтрация и поиск'
            accentClass='bg-accent-green'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.RSLANG)}
            icon={<IconFormula className='h-6 w-6' />}
            title='Язык родов структур'
            description='Формальная логика определений. Структурность, корректность и интерпретация определений'
            accentClass='bg-accent-blue'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.ASSISTANT)}
            icon={<IconRobot className='h-6 w-6' />}
            title='ИИ-помощник'
            description='Шаблоны запросов и подсказки для ускорения работы с предметной областью'
            accentClass='bg-accent-teal/70'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_SYSTEM)}
            icon={<IconRSForm className='h-6 w-6' />}
            title='Системы определений'
            description='Концептуальная схема, графы структуры и связей, строгий понятийный аппарат'
            accentClass='bg-accent-purple'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_RSMODEL)}
            icon={<IconRSModel className='h-6 w-6' />}
            title='Концептуальные модели'
            description='Предметные источники данных, интерпретация определений и вычисление значений'
            accentClass='bg-accent-orange'
          />
          <FeatureTile
            to={urls.help_topic(HelpTopic.CC_OSS)}
            icon={<IconOSS className='h-6 w-6' />}
            title='Операционные схемы'
            description='Операции над концептуальными схемами, блоки предметного содержания и сквозные изменения'
            accentClass='bg-accent-green'
          />
        </div>
      </section>
    </div>
  );
}
