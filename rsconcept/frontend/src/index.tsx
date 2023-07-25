'use client';

import './index.css';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import ErrorFallback from './components/ErrorFallback';
import { AuthState } from './context/AuthContext';
import { ThemeState } from './context/ThemeContext';
import { UsersState } from './context/UsersContext';

axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'x-csrftoken'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const resetState = () => {
  console.log('Resetting state after error fallback')
};

const logError = (error: Error, info: { componentStack: string }) => {
  console.log('Error fallback: ' + error.message)
  console.log('Component stack: ' + info.componentStack)
};

root.render(
  <React.StrictMode>
  <BrowserRouter>
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={resetState}
    onError={logError}
  >
  <IntlProvider locale='ru' defaultLocale='ru'>
  <ThemeState>
  <AuthState>
  <UsersState>
    <App />
  </UsersState>
  </AuthState>
  </ThemeState>
  </IntlProvider>
  </ErrorBoundary>
  </BrowserRouter>
  </React.StrictMode>
);
