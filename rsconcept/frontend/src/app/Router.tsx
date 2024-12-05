import React from 'react';
import { createBrowserRouter } from 'react-router';

import CreateItemPage from '@/pages/CreateItemPage';
import HomePage from '@/pages/HomePage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import OssPage from '@/pages/OssPage';
import RSFormPage from '@/pages/RSFormPage';

import ApplicationLayout from './ApplicationLayout';
import { routes } from './urls';

const UserProfilePage = React.lazy(() => import('@/pages/UserProfilePage'));
const RestorePasswordPage = React.lazy(() => import('@/pages/RestorePasswordPage'));
const PasswordChangePage = React.lazy(() => import('@/pages/PasswordChangePage'));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'));
const ManualsPage = React.lazy(() => import('@/pages/ManualsPage'));
const IconsPage = React.lazy(() => import('@/pages/IconsPage'));
const DatabaseSchemaPage = React.lazy(() => import('@/pages/DatabaseSchemaPage'));

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
