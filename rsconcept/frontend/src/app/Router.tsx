import { createBrowserRouter } from 'react-router-dom';

import CreateItemPage from '@/pages/CreateRSFormPage';
import HomePage from '@/pages/HomePage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import ManualsPage from '@/pages/ManualsPage';
import NotFoundPage from '@/pages/NotFoundPage';
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
        path: routes.manuals,
        element: <ManualsPage />
      }
    ]
  }
]);
