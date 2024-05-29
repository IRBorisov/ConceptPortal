import { IconControls, IconText, IconTextOff, IconTree } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/OptionsContext';
import { useRSForm } from '@/context/RSFormContext';

interface ExpressionToolbarProps {
  disabled?: boolean;
  showControls: boolean;

  toggleControls: () => void;
  showAST: () => void;
}

function ExpressionToolbar({ disabled, showControls, toggleControls, showAST }: ExpressionToolbarProps) {
  const model = useRSForm();
  const { mathFont, setMathFont } = useConceptOptions();

  function toggleFont() {
    setMathFont(mathFont === 'math' ? 'math2' : 'math');
  }

  return (
    <Overlay position='top-[-0.5rem] right-0 cc-icons'>
      <MiniButton
        title='Изменить шрифт'
        onClick={toggleFont}
        icon={
          mathFont === 'math' ? <IconText size='1.25rem' className='icon-primary' /> : <IconTextOff size='1.25rem' />
        }
      />
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

export default ExpressionToolbar;
