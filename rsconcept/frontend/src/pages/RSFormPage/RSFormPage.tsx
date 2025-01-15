'use client';

import { useParams } from 'react-router';

import { RSFormState } from '@/context/RSFormContext';
import useQueryStrings from '@/hooks/useQueryStrings';

import RSTabs from './RSTabs';

function RSFormPage() {
  const params = useParams();
  const query = useQueryStrings();
  const version = query.get('v') ?? undefined;
  return (
    <RSFormState itemID={params.id ?? ''} versionID={version}>
      <RSTabs />
    </RSFormState>
  );
}

export default RSFormPage;
