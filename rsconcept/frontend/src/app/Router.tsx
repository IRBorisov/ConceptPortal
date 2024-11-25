import { createBrowserRouter } from 'react-router';

import CreateItemPage from '@/pages/CreateItemPage';
import DatabaseSchemaPage from '@/pages/DatabaseSchemaPage';
import HomePage from '@/pages/HomePage';
import IconsPage from '@/pages/IconsPage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import ManualsPage from '@/pages/ManualsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import OssPage from '@/pages/OssPage';
import PasswordChangePage from '@/pages/PasswordChangePage';
import RegisterPage from '@/pages/RegisterPage';
import RestorePasswordPage from '@/pages/RestorePasswordPage';
import RSFormPage from '@/pages/RSFormPage';
import UserProfilePage from '@/pages/UserProfilePage';

import ApplicationLayout from './ApplicationLayout';
import { routes } from './urls';

export const Router = createBrowserRouter([
  {
    path: '/',
    element: <ApplicationLayout />,
    errorElement: <NotFoundPage />,
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
        element: <RegisterPage />
      },
      {
        path: routes.profile,
        element: <UserProfilePage />
      },
      {
        path: routes.restore_password,
        element: <RestorePasswordPage />
      },
      {
        path: routes.password_change,
        element: <PasswordChangePage />
      },
      {
        path: routes.library,
        element: <LibraryPage />
      },
      {
        path: routes.create_schema,
        element: <CreateItemPage />
      },
      {
        path: `${routes.rsforms}/:id`,
        element: <RSFormPage />
      },
      {
        path: `${routes.oss}/:id`,
        element: <OssPage />
      },
      {
        path: routes.manuals,
        element: <ManualsPage />
      },
      {
        path: `${routes.icons}`,
        element: <IconsPage />
      },
      {
        path: `${routes.database_schema}`,
        element: <DatabaseSchemaPage />
      }
    ]
  }
]);
