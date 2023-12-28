'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';

import { IExpressionParse, IRSErrorDescription } from '@/models/rslang';
import { animateParseResults } from '@/utils/animations';
import { describeRSError } from '@/utils/labels';
import { getRSErrorPrefix } from '@/utils/misc';

interface ParsingResultProps {
  data: IExpressionParse | undefined;
  disabled?: boolean;
  isOpen: boolean;
  onShowError: (error: IRSErrorDescription) => void;
}

function ParsingResult({ isOpen, data, disabled, onShowError }: ParsingResultProps) {
  const errorCount = data ? data.errors.reduce((total, error) => (error.isCritical ? total + 1 : total), 0) : 0;
  const warningsCount = data ? data.errors.length - errorCount : 0;

  return (
    <motion.div
      className={clsx('border', 'text-sm', 'overflow-y-auto')}
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={animateParseResults}
    >
      <p>
        Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b>
      </p>
      {data?.errors.map((error, index) => {
        return (
          <p
            key={`error-${index}`}
            className={`clr-text-warning ${disabled ? '' : 'cursor-pointer'}`}
            onClick={disabled ? undefined : () => onShowError(error)}
          >
            <span className='mr-1 font-semibold underline'>
              {error.isCritical ? 'Ошибка' : 'Предупреждение'} {`${getRSErrorPrefix(error)}:`}
            </span>
            <span>{` ${describeRSError(error)}`}</span>
          </p>
        );
      })}
    </motion.div>
  );
}

export default ParsingResult;
