import { createBrowserRouter } from 'react-router';

import { prefetchAuth } from '@/features/auth/backend/use-auth';
import { LoginPage } from '@/features/auth/pages/login-page';
import { HomePage } from '@/features/home/home-page';
import { NotFoundPage } from '@/features/home/not-found-page';
import { prefetchLibrary } from '@/features/library/backend/use-library';
import { CreateItemPage } from '@/features/library/pages/create-item-page';
import { prefetchOSS } from '@/features/oss/backend/use-oss';
import { prefetchRSForm } from '@/features/rsform/backend/use-rsform';
import { prefetchProfile } from '@/features/users/backend/use-profile';
import { prefetchUsers } from '@/features/users/backend/use-users';

import { Loader } from '@/components/loader';

import { ApplicationLayout } from './application-layout';
import { ErrorFallback } from './error-fallback';
import { routes } from './urls';

export const Router = createBrowserRouter([
  {
    path: '/',
    element: <ApplicationLayout />,
    errorElement: <ErrorFallback />,
    loader: prefetchAuth,
    hydrateFallbackElement: fallbackLoader(),
    children: [
      {
        path: '',
        element: <HomePage />
      },
      {
        path: `${routes.not_found}`,
        element: <NotFoundPage />
      },
      {
        path: routes.login,
        element: <LoginPage />
      },
      {
        path: routes.signup,
        lazy: () => import('@/features/users/pages/register-page')
      },
      {
        path: routes.profile,
        loader: prefetchProfile,
        lazy: () => import('@/features/users/pages/user-profile-page')
      },
      {
        path: routes.restore_password,
        lazy: () => import('@/features/auth/pages/restore-password-page')
      },
      {
        path: routes.password_change,
        lazy: () => import('@/features/auth/pages/password-change-page')
      },
      {
        path: routes.library,
        loader: () => Promise.allSettled([prefetchLibrary(), prefetchUsers()]),
        lazy: () => import('@/features/library/pages/library-page')
      },
      {
        path: routes.create_schema,
        element: <CreateItemPage />
      },
      {
        path: `${routes.rsforms}/:id`,
        loader: data => prefetchRSForm(parseRSFormURL(data.params.id, data.request.url)),
        lazy: () => import('@/features/rsform/pages/rsform-page')
      },
      {
        path: `${routes.oss}/:id`,
        loader: data => prefetchOSS(parseOssURL(data.params.id)),
        lazy: () => import('@/features/oss/pages/oss-page')
      },
      {
        path: routes.manuals,
        lazy: () => import('@/features/help/pages/manuals-page')
      },
      {
        path: `${routes.icons}`,
        lazy: () => import('@/features/home/icons-page')
      },
      {
        path: `${routes.database_schema}`,
        lazy: () => import('@/features/home/database-schema-page')
      }
    ]
  }
]);

// ======= Internals =========
function parseRSFormURL(id: string | undefined, url: string) {
  const params = new URLSearchParams(url.split('?')[1]);
  const version = params.get('v');
  return { itemID: id ? Number(id) : undefined, version: version ? Number(version) : undefined };
}

function parseOssURL(id: string | undefined) {
  return { itemID: id ? Number(id) : undefined };
}

function fallbackLoader() {
  return (
    <div className='flex justify-center items-center h-[100dvh]'>
      <Loader scale={6} />
    </div>
  );
}
