'use client';

import { useParams } from 'react-router';

import { AccessModeState } from '@/context/AccessModeContext';
import { OssState } from '@/context/OssContext';

import OssTabs from './OssTabs';

function OssPage() {
  const params = useParams();
  return (
    <AccessModeState>
      <OssState itemID={params.id ?? ''}>
        <OssTabs />
      </OssState>
    </AccessModeState>
  );
}

export default OssPage;
