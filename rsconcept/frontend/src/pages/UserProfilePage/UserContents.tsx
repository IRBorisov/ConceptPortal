'use client';

import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

import { SubscribeIcon } from '@/components/DomainIcons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import AnimateFade from '@/components/wrap/AnimateFade';
import DataLoader from '@/components/wrap/DataLoader';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useUserProfile } from '@/context/UserProfileContext';

import EditorPassword from './EditorPassword';
import EditorProfile from './EditorProfile';
import TableSubscriptions from './TableSubscriptions';

function UserContents() {
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
      <AnimateFade className='flex gap-6 py-2 mx-auto w-fit'>
        <div className='w-fit'>
          <Overlay position='top-0 right-0'>
            <MiniButton
              title='Отслеживаемые схемы'
              icon={<SubscribeIcon value={showSubs} className='icon-primary' />}
              onClick={() => setShowSubs(prev => !prev)}
            />
          </Overlay>
          <h1 className='mb-4 select-none'>Учетные данные пользователя</h1>
          <div className='flex py-2'>
            <EditorProfile />
            <EditorPassword />
          </div>
        </div>
        <AnimatePresence>
          {subscriptions.length > 0 && showSubs ? <TableSubscriptions items={subscriptions} /> : null}
        </AnimatePresence>
      </AnimateFade>
    </DataLoader>
  );
}

export default UserContents;
