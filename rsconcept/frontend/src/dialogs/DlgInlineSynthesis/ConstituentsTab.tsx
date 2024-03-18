'use client';

import { LibraryItemID } from '@/models/library';
import { IRSForm } from '@/models/rsform';

interface ConstituentsTabProps {
  schema?: IRSForm;
  loading?: boolean;
  selected: LibraryItemID[];
  setSelected: React.Dispatch<LibraryItemID[]>;
}

// { schema, loading, selected, setSelected }: ConstituentsTabProps
function ConstituentsTab(props: ConstituentsTabProps) {
  return <>2 - {props.loading}</>;
}

export default ConstituentsTab;
