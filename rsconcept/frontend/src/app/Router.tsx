import { createBrowserRouter } from 'react-router';

import { prefetchAuth } from '@/features/auth/backend/useAuth';
import LoginPage from '@/features/auth/pages/LoginPage';
import HomePage from '@/features/home/HomePage';
import NotFoundPage from '@/features/home/NotFoundPage';
import { prefetchLibrary } from '@/features/library/backend/useLibrary';
import CreateItemPage from '@/features/library/pages/CreateItemPage';
import { prefetchOSS } from '@/features/oss/backend/useOSS';
import { prefetchRSForm } from '@/features/rsform/backend/useRSForm';
import { prefetchProfile } from '@/features/users/backend/useProfile';
import { prefetchUsers } from '@/features/users/backend/useUsers';

import { Loader } from '@/components/Loader';

import ApplicationLayout from './ApplicationLayout';
import { ErrorFallback } from './ErrorFallback';
import { routes } from './urls';

export const Router = createBrowserRouter([
  {
    path: '/',
    element: <ApplicationLayout />,
    errorElement: <ErrorFallback />,
    loader: prefetchAuth,
    hydrateFallbackElement: <Loader />,
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
        lazy: () => import('@/features/users/pages/RegisterPage')
      },
      {
        path: routes.profile,
        loader: prefetchProfile,
        lazy: () => import('@/features/users/pages/UserProfilePage')
      },
      {
        path: routes.restore_password,
        lazy: () => import('@/features/auth/pages/RestorePasswordPage')
      },
      {
        path: routes.password_change,
        lazy: () => import('@/features/auth/pages/PasswordChangePage')
      },
      {
        path: routes.library,
        loader: () => Promise.allSettled([prefetchLibrary(), prefetchUsers()]),
        lazy: () => import('@/features/library/pages/LibraryPage')
      },
      {
        path: routes.create_schema,
        element: <CreateItemPage />
      },
      {
        path: `${routes.rsforms}/:id`,
        loader: data => prefetchRSForm(parseRSFormURL(data.params.id, data.request.url)),
        lazy: () => import('@/features/rsform/pages/RSFormPage')
      },
      {
        path: `${routes.oss}/:id`,
        loader: data => prefetchOSS(parseOssURL(data.params.id)),
        lazy: () => import('@/features/oss/pages/OssPage')
      },
      {
        path: routes.manuals,
        lazy: () => import('@/features/help/pages/ManualsPage')
      },
      {
        path: `${routes.icons}`,
        lazy: () => import('@/features/home/IconsPage')
      },
      {
        path: `${routes.database_schema}`,
        lazy: () => import('@/features/home/DatabaseSchemaPage')
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
