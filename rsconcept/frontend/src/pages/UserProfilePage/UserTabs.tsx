'use client';

import { useMemo, useState } from 'react';

import { ConceptLoader } from '@/components/Common/ConceptLoader';
import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import { NotSubscribedIcon,SubscribedIcon } from '@/components/Icons';
import InfoError from '@/components/InfoError';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useUserProfile } from '@/context/UserProfileContext';

import EditorPassword from './EditorPassword';
import EditorProfile from './EditorProfile';
import ViewSubscriptions from './ViewSubscriptions';

function UserTabs() {
  const { user, error, loading } = useUserProfile();
  const { user: auth } = useAuth();
  const { items } = useLibrary();

  const [showSubs, setShowSubs] = useState(false);

  const subscriptions = useMemo(
  () => {
    return items.filter(item => auth?.subscriptions.includes(item.id));
  }, [auth, items]);

  return (
  <>
    {loading ? <ConceptLoader /> : null}
    {error ? <InfoError error={error} /> : null}
    {user ? 
    <div className='flex justify-center gap-2 py-2'>
      <div className='flex flex-col gap-2 min-w-max'>
        <Overlay position='mt-2 top-0 right-0'>
          <MiniButton
            tooltip='Показать/Скрыть список отслеживаний'
            icon={showSubs
              ? <SubscribedIcon color='clr-text-primary' size={5}/>
              : <NotSubscribedIcon color='clr-text-primary' size={5}/>
            }
            onClick={() => setShowSubs(prev => !prev)}
          />
        </Overlay>
        <h1>Учетные данные пользователя</h1>
        <div className='flex justify-center py-2 max-w-fit'>
          <EditorProfile />
          <EditorPassword />
        </div>   
      </div>
      {(subscriptions.length > 0 && showSubs) ?
      <div className='flex flex-col w-full gap-6 pl-4'>
        <h1>Отслеживаемые схемы</h1>
        <ViewSubscriptions items={subscriptions} />
      </div> : null}
    </div> : null}
  </>);
}

export default UserTabs;