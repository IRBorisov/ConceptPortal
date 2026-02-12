'use client';

import { type Block } from '../models/oss';

interface InfoOperationProps {
  block: Block;
}

export function InfoBlock({ block }: InfoOperationProps) {
  return (
    <>
      {block.title ? (
        <p>
          <b>Название: </b>
          {block.title}
        </p>
      ) : null}
      {block.description ? (
        <p>
          <b>Описание: </b>
          {block.description}
        </p>
      ) : null}
    </>
  );
}
