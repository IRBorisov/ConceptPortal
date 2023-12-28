'use client';

import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FiBell, FiBellOff } from 'react-icons/fi';

import { ConceptLoader } from '@/components/Common/ConceptLoader';
import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
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

  const subscriptions = useMemo(() => {
    return items.filter(item => auth?.subscriptions.includes(item.id));
  }, [auth, items]);

  return (
    <>
      {loading ? <ConceptLoader /> : null}
      {error ? <InfoError error={error} /> : null}
      {user ? (
        <div className='flex gap-6 py-2'>
          <div>
            <Overlay position='top-0 right-0'>
              <MiniButton
                title='Показать/Скрыть отслеживаемые схемы'
                icon={
                  showSubs ? (
                    <FiBell size='1.25rem' className='clr-text-primary' />
                  ) : (
                    <FiBellOff size='1.25rem' className='clr-text-primary' />
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
        </div>
      ) : null}
    </>
  );
}

export default UserTabs;
