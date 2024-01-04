import { createBrowserRouter } from 'react-router-dom';

import CreateRSFormPage from '@/pages/CreateRSFormPage';
import HomePage from '@/pages/HomePage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import ManualsPage from '@/pages/ManualsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterPage from '@/pages/RegisterPage';
import RestorePasswordPage from '@/pages/RestorePasswordPage';
import RSFormPage from '@/pages/RSFormPage';
import UserProfilePage from '@/pages/UserProfilePage';

import ApplicationLayout from './ApplicationLayout';

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
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'signup',
        element: <RegisterPage />
      },
      {
        path: 'restore-password',
        element: <RestorePasswordPage />
      },
      {
        path: 'profile',
        element: <UserProfilePage />
      },
      {
        path: 'manuals',
        element: <ManualsPage />
      },
      {
        path: 'library',
        element: <LibraryPage />
      },
      {
        path: 'library/create',
        element: <CreateRSFormPage />
      },
      {
        path: 'rsforms/:id',
        element: <RSFormPage />
      }
    ]
  }
]);
