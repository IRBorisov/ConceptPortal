import { useMemo } from 'react';

import { ExpressionStatus, type IConstituenta, inferStatus, ParsingStatus } from '../../utils/models';
import { getStatusInfo } from '../../utils/staticUI';

interface StatusBarProps {
  isModified?: boolean
  parseData?: any
  constituenta?: IConstituenta
}

function StatusBar({ isModified, constituenta, parseData }: StatusBarProps) {
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

  const data = getStatusInfo(status);
  return (
    <div title={data.tooltip}
      className={'min-h-[2rem] min-w-[6rem] font-semibold inline-flex border rounded-lg items-center justify-center align-middle ' + data.color}>
      {data.text}
    </div>
  )
}

export default StatusBar;
