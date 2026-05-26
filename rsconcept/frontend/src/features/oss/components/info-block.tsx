'use client';

import { useTx } from '@/i18n';
import { type Block } from '@rsconcept/domain/library';

interface InfoOperationProps {
  block: Block;
}

export function InfoBlock({ block }: InfoOperationProps) {
  const tx = useTx();
  return (
    <>
      {block.title ? (
        <p>
          <b>{tx('tx.lib.title') + tx('tx.general.colon')}</b>
          {block.title}
        </p>
      ) : null}
      {block.description ? (
        <p>
          <b>{tx('tx.lib.description') + tx('tx.general.colon')}</b>
          {block.description}
        </p>
      ) : null}
    </>
  );
}
