'use client';

import { type Block } from '@/domain/library';
import { useTx } from '@/i18n/use-tx';

interface InfoOperationProps {
  block: Block;
}

export function InfoBlock({ block }: InfoOperationProps) {
  const tx = useTx();
  return (
    <>
      {block.title ? (
        <p>
          <b>{tx('ui.oss.infoOperation.titleWithColon', 'Title: ')}</b>
          {block.title}
        </p>
      ) : null}
      {block.description ? (
        <p>
          <b>{tx('ui.oss.infoOperation.descriptionWithColon', 'Description: ')}</b>
          {block.description}
        </p>
      ) : null}
    </>
  );
}
