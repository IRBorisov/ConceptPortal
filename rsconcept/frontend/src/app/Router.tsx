import { createBrowserRouter } from 'react-router';

import { prefetchAuth } from '@/backend/auth/useAuth';
import { prefetchLibrary } from '@/backend/library/useLibrary';
import { prefetchOSS } from '@/backend/oss/useOSS';
import { prefetchRSForm } from '@/backend/rsform/useRSForm';
import { prefetchProfile } from '@/backend/users/useProfile';
import { prefetchUsers } from '@/backend/users/useUsers';
import Loader from '@/components/ui/Loader';
import CreateItemPage from '@/pages/CreateItemPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';

import ApplicationLayout from './ApplicationLayout';
import { routes } from './urls';

export const Router = createBrowserRouter([
  {
    path: '/',
    element: <ApplicationLayout />,
    errorElement: <NotFoundPage />,
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
        lazy: () => import('@/pages/RegisterPage')
      },
      {
        path: routes.profile,
        loader: prefetchProfile,
        lazy: () => import('@/pages/UserProfilePage')
      },
      {
        path: routes.restore_password,
        lazy: () => import('@/pages/RestorePasswordPage')
      },
      {
        path: routes.password_change,
        lazy: () => import('@/pages/PasswordChangePage')
      },
      {
        path: routes.library,
        loader: () => Promise.allSettled([prefetchLibrary(), prefetchUsers()]),
        lazy: () => import('@/pages/LibraryPage')
      },
      {
        path: routes.create_schema,
        element: <CreateItemPage />
      },
      {
        path: `${routes.rsforms}/:id`,
        loader: data => prefetchRSForm(parseRSFormURL(data.params.id, data.request.url)),
        lazy: () => import('@/pages/RSFormPage')
      },
      {
        path: `${routes.oss}/:id`,
        loader: data => prefetchOSS(parseOssURL(data.params.id)),
        lazy: () => import('@/pages/OssPage')
      },
      {
        path: routes.manuals,
        lazy: () => import('@/pages/ManualsPage')
      },
      {
        path: `${routes.icons}`,
        lazy: () => import('@/pages/IconsPage')
      },
      {
        path: `${routes.database_schema}`,
        lazy: () => import('@/pages/DatabaseSchemaPage')
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
