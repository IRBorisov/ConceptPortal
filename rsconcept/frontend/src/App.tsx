import { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Navigation from './components/Navigation/Navigation';
import ToasterThemed from './components/ToasterThemed';
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

function App () {
  const { noNavigation } = useConceptTheme();

  const scrollWindowSize = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 4.5rem)'
    : '100vh'; 
  }, [noNavigation]);
  const mainSize = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 12rem)'
    : '100vh'; 
  }, [noNavigation]);
  
  return (
    <div className='antialiased clr-app'>
      <Navigation />
      <ToasterThemed
        className='mt-[4rem] text-sm'
        autoClose={3000}
        draggable={false}
        pauseOnFocusLoss={false}
      />
      
      <div className='overflow-auto' style={{maxHeight: scrollWindowSize}}>
      <main  className='px-2' style={{minHeight: mainSize}}>
        <Routes>
          <Route path='/' element={ <HomePage/>} />

          <Route path='login' element={ <LoginPage/>} />
          <Route path='signup' element={<RegisterPage/>} />
          <Route path='restore-password' element={ <RestorePasswordPage/>} />
          <Route path='profile' element={<UserProfilePage/>} />

          <Route path='manuals' element={<ManualsPage/>} />

          <Route path='library' element={<LibraryPage/>} />
          <Route path='rsforms/:id' element={ <RSFormPage/>} />
          <Route path='rsform-create' element={ <CreateRSFormPage/>} />
          <Route path='*' element={ <NotFoundPage/>} />
        </Routes>
      </main>
      {!noNavigation && <Footer />}
      </div>
    </div>
  );
}

export default App;
