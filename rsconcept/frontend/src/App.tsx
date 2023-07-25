import { Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Navigation from './components/Navigation/Navigation';
import ToasterThemed from './components/ToasterThemed';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ManualsPage from './pages/ManualsPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import RestorePasswordPage from './pages/RestorePasswordPage';
import RSFormCreatePage from './pages/RSFormCreatePage';
import RSFormPage from './pages/RSFormPage';
import RSFormsPage from './pages/RSFormsPage';
import UserProfilePage from './pages/UserProfilePage';

function App () {
  return (
    <div className='antialiased clr-app'>
      <Navigation />
      <ToasterThemed
        className='mt-[4rem] text-sm'
        autoClose={3000}
        draggable={false}
        pauseOnFocusLoss={false}
      />
      <main className='min-h-[calc(100vh-7.5rem)] px-2 h-fit'>
        <Routes>
          <Route path='/' element={ <HomePage/>} />

          <Route path='login' element={ <LoginPage/>} />
          <Route path='signup' element={<RegisterPage/>} />
          <Route path='restore-password' element={ <RestorePasswordPage/>} />
          <Route path='profile' element={<UserProfilePage/>} />

          <Route path='manuals' element={<ManualsPage/>} />

          <Route path='rsforms' element={<RSFormsPage/>} />
          <Route path='rsforms/:id' element={ <RSFormPage/>} />
          <Route path='rsform-create' element={ <RSFormCreatePage/>} />
          <Route path='*' element={ <NotFoundPage/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
