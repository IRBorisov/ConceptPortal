import { MiniButton } from '@/components/Control';
import { IconControls, IconTree, IconTypeGraph } from '@/components/Icons';
import { usePreferencesStore } from '@/stores/preferences';

import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';

interface ToolbarRSExpressionProps {
  disabled?: boolean;
  showAST: (event: React.MouseEvent<Element>) => void;
  showTypeGraph: (event: React.MouseEvent<Element>) => void;
}

export function ToolbarRSExpression({ disabled, showTypeGraph, showAST }: ToolbarRSExpressionProps) {
  const isProcessing = useMutatingRSForm();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const toggleControls = usePreferencesStore(state => state.toggleShowExpressionControls);

  return (
    <div className='absolute z-pop top-[-0.5rem] right-0 cc-icons'>
      {!disabled || isProcessing ? (
        <MiniButton
          title='Отображение специальной клавиатуры'
          icon={<IconControls size='1.25rem' className={showControls ? 'icon-primary' : ''} />}
          onClick={toggleControls}
        />
      ) : null}
      <MiniButton
        title='Граф ступеней типизации'
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        onClick={showTypeGraph}
      />
      <MiniButton
        title='Дерево разбора выражения'
        onClick={showAST}
        icon={<IconTree size='1.25rem' className='icon-primary' />}
      />
    </div>
  );
}
