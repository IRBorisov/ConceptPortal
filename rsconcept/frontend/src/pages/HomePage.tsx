import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (user) {
    navigate('/library?filter=personal');
  } else {
    navigate('/library?filter=common');
  }

  return (
    <div className='flex flex-col items-center justify-center w-full py-2'>
      <p>Home page</p>
    </div>
  );
}

export default HomePage;
