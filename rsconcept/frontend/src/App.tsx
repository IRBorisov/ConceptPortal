import { Route, Routes } from 'react-router-dom';

import Navigation from './components/Navigation/Navigation';
import RSFormsPage from './pages/RSFormsPage';
import RSFormPage from './pages/RSFormPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RestorePasswordPage from './pages/RestorePasswordPage';
import UserProfilePage from './pages/UserProfilePage';
import RegisterPage from './pages/RegisterPage';
import ManualsPage from './pages/ManualsPage';
import Footer from './components/Footer';
import RSFormCreatePage from './pages/RSFormCreatePage';
import ToasterThemed from './components/ToasterThemed';

function App() {
  return (
    <div className='antialiased bg-gray-50 dark:bg-gray-800'>
      <Navigation />
      <ToasterThemed
        className='mt-[4rem] text-sm'
        autoClose={3000}
        draggable={false}
        limit={5}
      />
      <main className='min-h-[calc(100vh-6.8rem)] px-2 h-fit'>
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