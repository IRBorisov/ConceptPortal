import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const {user} = useAuth();
  if (user) {
    navigate('/rsforms?filter=personal');
  } else {
    navigate('/rsforms?filter=common');
  }
  
  return (
    <div className='flex flex-col items-center justify-center w-full py-2'>
      <p>Home page</p>
    </div>
  );
}

export default HomePage;