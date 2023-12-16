'use client';

import { useParams } from 'react-router-dom';

import { AccessModeState } from '@/context/AccessModeContext';
import { RSFormState } from '@/context/RSFormContext';

import RSTabs from './RSTabs';

function RSFormPage() {
  const params = useParams();
  return (
  <AccessModeState>
  <RSFormState schemaID={params.id ?? ''}>
    <RSTabs />
  </RSFormState>
  </AccessModeState>);
}

export default RSFormPage;