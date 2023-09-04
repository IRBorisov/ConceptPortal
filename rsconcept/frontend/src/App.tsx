import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import ConceptToaster from './components/ConceptToaster';
import Footer from './components/Footer';
import Navigation from './components/Navigation/Navigation';
import { NavigationState } from './context/NagivationContext';
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
  const { noNavigation, noFooter, viewportHeight, mainHeight, showScroll } = useConceptTheme();
  return (
    <NavigationState>
    <div className='w-screen antialiased clr-app'>
      
      <ConceptToaster
        className='mt-[4rem] text-sm'
        autoClose={3000}
        draggable={false}
        pauseOnFocusLoss={false}
      />
      
      <Navigation />
      <div id={globalIDs.main_scroll}
        className='w-full overflow-x-auto'
        style={{
          maxHeight: viewportHeight,
          overflowY: showScroll ? 'scroll': 'auto'
        }}
      >
        <main className='w-full h-full' style={{minHeight: mainHeight}}>
          <Outlet />
        </main>
      {!noNavigation && !noFooter && <Footer />}
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
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <RegisterPage />,
      },
      {
        path: 'restore-password',
        element: <RestorePasswordPage />,
      },
      {
        path: 'profile',
        element: <UserProfilePage />,
      },
      {
        path: 'manuals',
        element: <ManualsPage />,
      },

      {
        path: 'library',
        element: <LibraryPage />,
      },
      {
        path: 'rsforms/:id',
        element: <RSFormPage />,
      },
      {
        path: 'rsform-create',
        element: <CreateRSFormPage />,
      },
    ]
  },
]);

function App () {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
