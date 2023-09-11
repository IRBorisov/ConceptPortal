import { useMemo } from 'react';

import { useConceptTheme } from '../../../context/ThemeContext';
import { ExpressionStatus } from '../../../models/rsform';
import { type IConstituenta, inferStatus } from '../../../models/rsform';
import { IExpressionParse, ParsingStatus } from '../../../models/rslang';
import { getCstStatusBgColor, mapStatusInfo } from '../../../utils/staticUI';

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

  const data = mapStatusInfo.get(status)!;
  return (
    <div title={data.tooltip}
      className='text-sm h-[1.6rem] w-[10rem] font-semibold inline-flex border items-center select-none justify-center align-middle'
      style={{backgroundColor: getCstStatusBgColor(status, colors)}}
    >
      Статус: [ {data.text} ]
    </div>
  )
}

export default StatusBar;
