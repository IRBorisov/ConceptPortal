import { ToastContainer, type ToastContainerProps } from 'react-toastify';

import { useConceptTheme } from '../context/ThemeContext';

interface ToasterThemedProps extends Omit<ToastContainerProps, 'theme'>{}

function ToasterThemed({ ...props }: ToasterThemedProps) {
  const { darkMode } = useConceptTheme();

  return (
    <ToastContainer
      theme={ darkMode ? 'dark' : 'light'}
      {...props}
    />
  );
}

export default ToasterThemed;
