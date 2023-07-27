import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (!user) {
    navigate('/library?filter=common');
  } else if(!user.is_staff) {
    navigate('/library?filter=personal');
  }

  return (
    <div className='flex flex-col items-center justify-center w-full py-2'>
      <p>Home page</p>
    </div>
  );
}

export default HomePage;
