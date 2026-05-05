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
          <b>{tx('semantic.term.title')}: </b>
          {block.title}
        </p>
      ) : null}
      {block.description ? (
        <p>
          <b>{tx('ui.oss.infoOperation.descriptionWithColon')}</b>
          {block.description}
        </p>
      ) : null}
    </>
  );
}
