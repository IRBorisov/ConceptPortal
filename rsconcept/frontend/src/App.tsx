import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import ConceptToaster from './components/ConceptToaster';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import { NavigationState } from './context/NavigationContext';
import { useConceptTheme } from './context/ThemeContext';
import CreateRSFormPage from './pages/CreateRSFormPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import ManualsPage from './pages/ManualsPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import RestorePasswordPage from './pages/RestorePasswordPage';
import RSFormPage from './pages/RSFormPage';
import UserProfilePage from './pages/UserProfilePage';
import { globalIDs } from './utils/constants';

function Root() {
  const { viewportHeight, mainHeight, showScroll } = useConceptTheme();
  return (
    <NavigationState>
      <div className='min-w-[30rem] clr-app antialiased'>
        <ConceptToaster
          className='mt-[4rem] text-sm' //
          autoClose={3000}
          draggable={false}
          pauseOnFocusLoss={false}
        />

        <Navigation />

        <div
          id={globalIDs.main_scroll}
          className='overflow-y-auto overscroll-none min-w-fit'
          style={{
            maxHeight: viewportHeight,
            overflowY: showScroll ? 'scroll' : 'auto'
          }}
        >
          <main className='flex flex-col items-center' style={{ minHeight: mainHeight }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </NavigationState>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
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

function App() {
  return <RouterProvider router={router} />;
}

export default App;
