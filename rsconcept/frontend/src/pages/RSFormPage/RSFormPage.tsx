'use client';

import { useParams } from 'react-router-dom';

import { AccessModeState } from '@/context/AccessModeContext';
import { RSFormState } from '@/context/RSFormContext';
import useQueryStrings from '@/hooks/useQueryStrings';

import RSTabs from './RSTabs';

function RSFormPage() {
  const params = useParams();
  const query = useQueryStrings();
  const version = query.get('v') ?? undefined;
  return (
    <AccessModeState>
      <RSFormState itemID={params.id ?? ''} versionID={version}>
        <RSTabs />
      </RSFormState>
    </AccessModeState>
  );
}

export default RSFormPage;
