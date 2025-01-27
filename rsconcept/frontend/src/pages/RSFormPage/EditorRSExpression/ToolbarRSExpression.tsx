import { useIsProcessingRSForm } from '@/backend/rsform/useIsProcessingRSForm';
import { IconControls, IconTree, IconTypeGraph } from '@/components/Icons';
import { CProps } from '@/components/props';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { usePreferencesStore } from '@/stores/preferences';

interface ToolbarRSExpressionProps {
  disabled?: boolean;
  showAST: (event: CProps.EventMouse) => void;
  showTypeGraph: (event: CProps.EventMouse) => void;
}

function ToolbarRSExpression({ disabled, showTypeGraph, showAST }: ToolbarRSExpressionProps) {
  const isProcessing = useIsProcessingRSForm();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const toggleControls = usePreferencesStore(state => state.toggleShowExpressionControls);

  return (
    <Overlay position='top-[-0.5rem] right-0' layer='z-pop' className='cc-icons'>
      {!disabled || isProcessing ? (
        <MiniButton
          title='Отображение специальной клавиатуры'
          icon={<IconControls size='1.25rem' className={showControls ? 'icon-primary' : ''} />}
          onClick={toggleControls}
        />
      ) : null}
      <MiniButton
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        title='Граф ступеней типизации'
        onClick={showTypeGraph}
      />
      <MiniButton
        title='Дерево разбора выражения'
        onClick={showAST}
        icon={<IconTree size='1.25rem' className='icon-primary' />}
      />
    </Overlay>
  );
}

export default ToolbarRSExpression;
