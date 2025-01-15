'use client';

import { useParams } from 'react-router';

import { OssState } from '@/context/OssContext';

import OssTabs from './OssTabs';

function OssPage() {
  const params = useParams();
  return (
    <OssState itemID={params.id ?? ''}>
      <OssTabs />
    </OssState>
  );
}

export default OssPage;
