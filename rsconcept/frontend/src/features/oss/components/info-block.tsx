'use client';

import { type Block } from '@/domain/library';
import { useTx } from '@/i18n';

interface InfoOperationProps {
  block: Block;
}

export function InfoBlock({ block }: InfoOperationProps) {
  const tx = useTx();
  return (
    <>
      {block.title ? (
        <p>
          <b>{tx('tx.lib.title')}: </b>
          {block.title}
        </p>
      ) : null}
      {block.description ? (
        <p>
          <b>{tx('tx.lib.description')}: </b>
          {block.description}
        </p>
      ) : null}
    </>
  );
}
