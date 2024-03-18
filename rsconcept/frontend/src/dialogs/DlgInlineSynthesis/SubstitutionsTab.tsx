'use client';

import { ICstSubstituteData, IRSForm } from '@/models/rsform';

interface SubstitutionsTabProps {
  receiver?: IRSForm;
  source?: IRSForm;
  loading?: boolean;
  substitutions: ICstSubstituteData[];
  setSubstitutions: React.Dispatch<ICstSubstituteData[]>;
}

// { source, receiver, loading, substitutions, setSubstitutions }: SubstitutionsTabProps
function SubstitutionsTab(props: SubstitutionsTabProps) {
  return <>3 - {props.loading}</>;
}

export default SubstitutionsTab;
