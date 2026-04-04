'use client';

import { Link } from 'react-router';

import { urls } from '@/app';

import { IconSandbox } from '@/components/icons';

/**
 * Placeholder for an offline-first RSModel playground aimed at guests.
 * Future: load a bundled demo model without auth or network (service worker / static assets).
 */
export function SandboxPage() {
  return (
    <div className='relative isolate flex min-h-dvh flex-col px-4 pb-12 pt-6 sm:px-6' role='region' aria-label='Песочница'>
      <div aria-hidden className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute -top-20 left-1/2 h-72 w-[min(36rem,100vw)] -translate-x-1/2 rounded-full bg-accent-teal/25 blur-3xl dark:bg-accent-teal/15' />
        <div className='absolute bottom-32 right-[10%] h-40 w-56 rounded-full bg-accent-purple/20 blur-3xl dark:bg-accent-purple/12' />
      </div>

      <header className='mx-auto w-full max-w-lg text-center'>
        <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-prim-200/80 bg-prim-100/70 text-sec-600 dark:border-prim-400/35 dark:bg-prim-200/40 dark:text-sec-400'>
          <IconSandbox className='h-8 w-8' aria-hidden />
        </div>
        <h1 className='font-ui text-2xl font-semibold tracking-tight text-prim-999 dark:text-prim-0'>Песочница</h1>
        <p className='mt-3 w-110 mx-auto text-pretty text-sm leading-relaxed text-prim-600 dark:text-prim-400'>
          Здесь появится автономный режим: демонстрационная модель без входа в аккаунт и без
          обращения к серверу — чтобы быстро познакомиться с функционалом Портала
        </p>
      </header>

      <div className='mx-auto mt-10 w-full max-w-lg rounded-xl bg-prim-100/30 p-6 text-center dark:bg-prim-100/20'>
        <p>Режим находится в разработке.<br />Следите за обновлениями</p>
      </div>

      <nav
        className='mx-auto flex w-full max-w-lg flex-col gap-2 pt-3 text-center font-medium text-primary underline-offset-2 sm:flex-row sm:justify-center'
        aria-label='Действия'
      >
        <Link
          to={urls.home}
          className='inline-flex items-center justify-center rounded-sm border border-transparent px-4 py-2 hover:underline'
        >
          На главную
        </Link>
        <Link
          to={urls.login}
          className='inline-flex items-center justify-center rounded-sm border border-transparent px-4 py-2 hover:underline'
        >
          Войти
        </Link>
        <Link
          to={urls.signup}
          className='inline-flex items-center justify-center rounded-sm border border-transparent px-4 py-2 hover:underline'
        >
          Регистрация
        </Link>
      </nav>
    </div>
  );
}
