'use client';

import { useParams } from 'react-router-dom';

import { RSFormState } from '@/context/RSFormContext';

import RSTabs from './RSTabs';

function RSFormPage() {
  const params = useParams();
  return (
  <RSFormState schemaID={params.id ?? ''}>
    <RSTabs />
  </RSFormState>);
}

export default RSFormPage;