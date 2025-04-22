'use client';

import { type IBlock } from '../models/oss';

interface InfoOperationProps {
  block: IBlock;
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
