'use client';

import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAccessMode } from '@/context/AccessModeContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useWindowSize from '@/hooks/useWindowSize';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { UserLevel } from '@/models/user';
import { PARAMETER } from '@/utils/constants';

import ConstituentsSearch from './ConstituentsSearch';
import TableSideConstituents from './TableSideConstituents';

// Window width cutoff for dense search bar
const COLUMN_DENSE_SEARCH_THRESHOLD = 1100;

interface ViewConstituentsProps {
  expression: string;
  isBottom?: boolean;
  activeCst?: IConstituenta;
  schema?: IRSForm;
  onOpenEdit: (cstID: ConstituentaID) => void;
  isMounted: boolean;
}

function ViewConstituents({ expression, schema, activeCst, isBottom, onOpenEdit, isMounted }: ViewConstituentsProps) {
  const { calculateHeight } = useConceptOptions();
  const windowSize = useWindowSize();
  const { accessLevel } = useAccessMode();

  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  const [isVisible, setIsVisible] = useState(true);
  const isFirstRender = useRef(true);
  const springs = useSpring({
    from: { opacity: 0, width: '0' },
    to: async next => {
      if (isFirstRender.current) {
        await next({ opacity: isMounted ? 1 : 0, width: isMounted ? '100%' : '0', config: { duration: 0 } });
        isFirstRender.current = false;
      } else {
        if (isMounted) {
          await next({ width: '100%', config: { duration: PARAMETER.moveDuration } });
          await next({ opacity: 1, config: { duration: PARAMETER.fadeDuration } });
        } else {
          await next({ opacity: 0, config: { duration: PARAMETER.fadeDuration } });
          await next({ width: '0', config: { duration: PARAMETER.moveDuration } });
        }
      }
    },
    onRest: props => {
      if (props.finished && !isMounted) {
        setIsVisible(false);
      }
    }
  });

  useEffect(() => {
    if (isMounted) {
      setIsVisible(true);
    }
  }, [isMounted]);

  const table = useMemo(
    () => (
      <TableSideConstituents
        maxHeight={
          isBottom
            ? calculateHeight(accessLevel !== UserLevel.READER ? '42rem' : '35rem', '10rem')
            : calculateHeight('8.2rem')
        }
        items={filteredData}
        activeCst={activeCst}
        onOpenEdit={onOpenEdit}
        autoScroll={!isBottom}
      />
    ),
    [isBottom, filteredData, activeCst, onOpenEdit, calculateHeight, accessLevel]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <animated.div
      className={clsx(
        'border', // prettier: split-lines
        {
          'mt-[2.2rem] rounded-l-md rounded-r-none h-fit overflow-visible': !isBottom,
          'mt-3 mx-6 rounded-md md:max-w-[45.8rem] overflow-hidden': isBottom
        }
      )}
      style={springs}
    >
      <ConstituentsSearch
        dense={windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD ? true : undefined}
        schema={schema}
        activeID={activeCst?.id}
        activeExpression={expression}
        setFiltered={setFilteredData}
      />
      {table}
    </animated.div>
  );
}

export default ViewConstituents;
