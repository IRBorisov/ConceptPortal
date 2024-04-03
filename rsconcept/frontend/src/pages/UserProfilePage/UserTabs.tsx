'use client';

import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

import { IconFollow, IconFollowOff } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import AnimateFade from '@/components/wrap/AnimateFade';
import DataLoader from '@/components/wrap/DataLoader';
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

  const subscriptions = useMemo(() => {
    return items.filter(item => auth?.subscriptions.includes(item.id));
  }, [auth, items]);

  return (
    <DataLoader
      id='profile-page' // prettier: split lines
      isLoading={loading}
      error={error}
      hasNoData={!user}
    >
      <AnimateFade className='flex gap-6 py-2'>
        <div>
          <Overlay position='top-0 right-0'>
            <MiniButton
              title='Отслеживаемые схемы'
              icon={
                showSubs ? (
                  <IconFollow size='1.25rem' className='icon-primary' />
                ) : (
                  <IconFollowOff size='1.25rem' className='icon-primary' />
                )
              }
              onClick={() => setShowSubs(prev => !prev)}
            />
          </Overlay>
          <h1 className='mb-4'>Учетные данные пользователя</h1>
          <div className='flex py-2'>
            <EditorProfile />
            <EditorPassword />
          </div>
        </div>
        <AnimatePresence>
          {subscriptions.length > 0 && showSubs ? <ViewSubscriptions items={subscriptions} /> : null}
        </AnimatePresence>
      </AnimateFade>
    </DataLoader>
  );
}

export default UserTabs;
