import { ToastContainer, type ToastContainerProps } from 'react-toastify';

import { useConceptTheme } from '../context/ThemeContext';

function ToasterThemed({ theme, ...props }: ToastContainerProps) {
  const { darkMode } = useConceptTheme();

  return (
    <ToastContainer
      theme={ darkMode ? 'dark' : 'light'}
      {...props}
    />
  );
}
export default ToasterThemed;
