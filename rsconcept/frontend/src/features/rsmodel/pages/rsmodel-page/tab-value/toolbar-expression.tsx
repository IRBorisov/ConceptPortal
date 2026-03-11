'use client';

import { toast } from 'react-toastify';

import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { type ExpressionType } from '@/features/rslang';

import { MiniButton } from '@/components/control';
import { IconTree, IconTypeGraph } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';
import { flattenAst } from '@/utils/parsing';

interface ToolbarExpressionProps {
  className?: string;
  expression: string;
  type: ExpressionType | null;
}

export function ToolbarExpression({ className, expression, type }: ToolbarExpressionProps) {
  const { schema } = useRSFormEdit();

  const showAST = useDialogsStore(state => state.showShowAST);
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);

  function handleShowAST() {
    const parse = schema.analyzer.checkFull(expression, { annotateTypes: true });
    if (!parse.ast) {
      toast.error(errorMsg.invalidParse);
      return;
    }
    const flatAst = flattenAst(parse.ast);
    showAST({ syntaxTree: flatAst, expression: expression });
  }

  function handleTypeGraph() {
    if (!type) {
      return;
    }
    showTypification({ items: [{ alias: 'TARGET', type: type }] });
  }

  return (
    <div className={cn('cc-icons', className)}>
      <MiniButton
        title='Структура типизации'
        icon={<IconTypeGraph size='1.25rem' className='hover:text-primary' />}
        onClick={handleTypeGraph}
        disabled={!type}
      />
      <MiniButton
        title='Структура выражения'
        onClick={handleShowAST}
        icon={<IconTree size='1.25rem' className='hover:text-primary' />}
        disabled={!type}
      />
    </div>
  );
}
