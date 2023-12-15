'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

import { useConceptTheme } from '@/context/ThemeContext';
import { ExpressionStatus } from '@/models/rsform';
import { type IConstituenta } from '@/models/rsform';
import { inferStatus } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { colorbgCstStatus } from '@/utils/color';
import { describeExpressionStatus, labelExpressionStatus } from '@/utils/labels';

interface StatusBarProps {
  isModified?: boolean
  parseData?: IExpressionParse
  constituenta?: IConstituenta
}

function StatusBar({ isModified, constituenta, parseData }: StatusBarProps) {
  const { colors } = useConceptTheme();
  const status = useMemo(() => {
    if (isModified) {
      return ExpressionStatus.UNKNOWN;
    }
    if (parseData) {
      const parse = parseData.parseResult ? ParsingStatus.VERIFIED : ParsingStatus.INCORRECT;
      return inferStatus(parse, parseData.valueClass);
    }
    return inferStatus(constituenta?.parse?.status, constituenta?.parse?.valueClass);
  }, [isModified, constituenta, parseData]);

  return (
  <div title={describeExpressionStatus(status)}
    className={clsx(
      'w-full h-full',
      'border rounded-none',
      'text-sm font-semibold small-caps text-center',
      'select-none'
    )}
    style={{backgroundColor: colorbgCstStatus(status, colors)}}
  >
    {labelExpressionStatus(status)}
  </div>);
}

export default StatusBar;