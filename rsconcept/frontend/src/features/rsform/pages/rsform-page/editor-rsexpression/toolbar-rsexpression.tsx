import { IconShowKeyboard } from '@/features/rsform/components/icon-show-keyboard';

import { MiniButton } from '@/components/control';
import { IconTree, IconTypeGraph } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';

interface ToolbarRSExpressionProps {
  className?: string;
  disabled?: boolean;
  showAST: (event: React.MouseEvent<Element>) => void;
  showTypeGraph: (event: React.MouseEvent<Element>) => void;
}

export function ToolbarRSExpression({ className, disabled, showTypeGraph, showAST }: ToolbarRSExpressionProps) {
  const isProcessing = useMutatingRSForm();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const toggleControls = usePreferencesStore(state => state.toggleShowExpressionControls);

  return (
    <div className={cn('cc-icons', className)}>
      {!disabled || isProcessing ? (
        <MiniButton
          title='Отображение специальной клавиатуры'
          icon={<IconShowKeyboard value={showControls} size='1.25rem' className='hover:text-primary' />}
          onClick={toggleControls}
        />
      ) : null}
      <MiniButton
        title='Граф ступеней типизации'
        icon={<IconTypeGraph size='1.25rem' className='hover:text-primary' />}
        onClick={showTypeGraph}
      />
      <MiniButton
        title='Дерево разбора выражения'
        onClick={showAST}
        icon={<IconTree size='1.25rem' className='hover:text-primary' />}
      />
    </div>
  );
}
