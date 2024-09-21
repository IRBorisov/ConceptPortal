import { IconControls, IconTree } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useRSForm } from '@/context/RSFormContext';

interface ToolbarRSExpressionProps {
  disabled?: boolean;
  showControls: boolean;

  toggleControls: () => void;
  showAST: () => void;
}

function ToolbarRSExpression({ disabled, showControls, toggleControls, showAST }: ToolbarRSExpressionProps) {
  const model = useRSForm();

  return (
    <Overlay position='top-[-0.5rem] right-0' layer='z-pop' className='cc-icons'>
      {!disabled || model.processing ? (
        <MiniButton
          title='Отображение специальной клавиатуры'
          icon={<IconControls size='1.25rem' className={showControls ? 'icon-primary' : ''} />}
          onClick={toggleControls}
        />
      ) : null}
      <MiniButton
        title='Дерево разбора выражения'
        onClick={showAST}
        icon={<IconTree size='1.25rem' className='icon-primary' />}
      />
    </Overlay>
  );
}

export default ToolbarRSExpression;
