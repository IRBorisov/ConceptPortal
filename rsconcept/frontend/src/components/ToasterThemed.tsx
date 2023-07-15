import { ToastContainer, ToastContainerProps } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

function ToasterThemed({theme, ...props}: ToastContainerProps) {
  const { darkMode } = useTheme();
  
  return (
    <ToastContainer 
      theme={ darkMode ? 'dark' : 'light'}
      {...props}
    />
  );
}
export default ToasterThemed;