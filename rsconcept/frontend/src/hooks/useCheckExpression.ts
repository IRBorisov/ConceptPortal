'use client';

import { useCallback, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import { postCheckExpression } from '@/backend/rsforms';
import { type ErrorData } from '@/components/info/InfoError';
import { CstType, IConstituenta, type IRSForm } from '@/models/rsform';
import { getDefinitionPrefix } from '@/models/rsformAPI';
import { IArgumentInfo, IExpressionParse } from '@/models/rslang';
import { RSErrorType } from '@/models/rslang';
import { PARAMETER } from '@/utils/constants';

function useCheckExpression({ schema }: { schema?: IRSForm }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);
  const [parseData, setParseData] = useState<IExpressionParse | undefined>(undefined);

  const resetParse = useCallback(() => setParseData(undefined), []);

  function checkExpression(expression: string, activeCst?: IConstituenta, onSuccess?: DataCallback<IExpressionParse>) {
    setError(undefined);
    postCheckExpression(String(schema!.id), {
      data: { expression: expression },
      showError: true,
      setLoading: setProcessing,
      onError: setError,
      onSuccess: parse => {
        if (activeCst) {
          adjustResults(parse, expression.trim() === getDefinitionPrefix(activeCst), activeCst.cst_type);
        }
        setParseData(parse);
        if (onSuccess) onSuccess(parse);
      }
    });
  }

  return { parseData, checkExpression, resetParse, error, setError, processing };
}

export default useCheckExpression;

// ===== Internals ========
function checkTypeConsistency(type: CstType, typification: string, args: IArgumentInfo[]): boolean {
  switch (type) {
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.TERM:
      return typification !== PARAMETER.logicLabel && args.length === 0;

    case CstType.AXIOM:
    case CstType.THEOREM:
      return typification === PARAMETER.logicLabel && args.length === 0;

    case CstType.FUNCTION:
      return typification !== PARAMETER.logicLabel && args.length !== 0;

    case CstType.PREDICATE:
      return typification === PARAMETER.logicLabel && args.length !== 0;
  }
}

function adjustResults(parse: IExpressionParse, emptyExpression: boolean, cstType: CstType) {
  if (!parse.parseResult && parse.errors.length > 0) {
    return;
  }
  if (cstType === CstType.BASE || cstType === CstType.CONSTANT) {
    if (!emptyExpression) {
      parse.parseResult = false;
      parse.errors.push({
        errorType: RSErrorType.globalNonemptyBase,
        isCritical: true,
        params: [],
        position: 0
      });
      return;
    }
  } else {
    if (emptyExpression) {
      parse.parseResult = false;
      parse.errors.push({
        errorType: RSErrorType.globalEmptyDerived,
        isCritical: true,
        params: [],
        position: 0
      });
      return;
    }
  }
  if (!checkTypeConsistency(cstType, parse.typification, parse.args)) {
    parse.parseResult = false;
    parse.errors.push({
      errorType: RSErrorType.globalUnexpectedType,
      isCritical: true,
      params: [],
      position: 0
    });
  }
}
