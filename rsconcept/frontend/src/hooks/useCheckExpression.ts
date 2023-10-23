import { useCallback, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { CstType, IConstituenta, type IRSForm } from '../models/rsform';
import { IExpressionParse, IFunctionArg } from '../models/rslang';
import { RSErrorType } from '../models/rslang';
import { DataCallback, postCheckExpression } from '../utils/backendAPI';
import { getCstExpressionPrefix } from '../utils/misc';

const LOGIC_TYPIIFCATION = 'LOGIC';

function checkTypeConsistency(type: CstType, typification: string, args: IFunctionArg[]): boolean {
  switch (type) {
  case CstType.BASE:
  case CstType.CONSTANT:
  case CstType.STRUCTURED:
  case CstType.TERM:
    return typification !== LOGIC_TYPIIFCATION && args.length === 0;

  case CstType.AXIOM:
  case CstType.THEOREM:
    return typification === LOGIC_TYPIIFCATION && args.length === 0;

  case CstType.FUNCTION:
    return typification !== LOGIC_TYPIIFCATION && args.length !== 0;

  case CstType.PREDICATE:
    return typification === LOGIC_TYPIIFCATION && args.length !== 0;
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

function useCheckExpression({ schema }: { schema?: IRSForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  const [parseData, setParseData] = useState<IExpressionParse | undefined>(undefined);

  const resetParse = useCallback(() => setParseData(undefined), []);

  function checkExpression(expression: string, activeCst?: IConstituenta, onSuccess?: DataCallback<IExpressionParse>) {
    setError(undefined);
    postCheckExpression(String(schema!.id), {
      data: { expression: expression },
      showError: true,
      setLoading,
      onError: error => setError(error),
      onSuccess: parse => {
        if (activeCst) {
          adjustResults(parse, expression === getCstExpressionPrefix(activeCst), activeCst.cst_type);
        }
        setParseData(parse);
        if (onSuccess) onSuccess(parse);
      }
    });
  }

  return { parseData, checkExpression, resetParse, error, setError, loading };
}

export default useCheckExpression;
