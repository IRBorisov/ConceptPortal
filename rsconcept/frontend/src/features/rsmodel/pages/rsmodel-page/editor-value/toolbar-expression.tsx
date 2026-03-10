'use client';

import { toast } from 'react-toastify';

import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { MiniButton } from '@/components/control';
import { IconTree, IconTypeGraph } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';
import { flattenAst } from '@/utils/parsing';

interface ToolbarExpressionProps {
  className?: string;
}

export function ToolbarExpression({ className }: ToolbarExpressionProps) {
  const { schema, activeCst } = useRSFormEdit();

  const showAST = useDialogsStore(state => state.showShowAST);
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);

  function handleShowAST() {
    if (!activeCst) {
      return;
    }
    const parse = schema.analyzer.checkFull(activeCst.definition_formal, { annotateTypes: true });
    if (!parse.ast) {
      toast.error(errorMsg.invalidParse);
      return;
    }
    const flatAst = flattenAst(parse.ast);
    showAST({ syntaxTree: flatAst, expression: activeCst.definition_formal });
  }

  function handleTypeGraph() {
    if (!activeCst) {
      return;
    }
    showTypification({ items: [{ alias: activeCst.alias, type: activeCst.analysis.type! }] });
  }

  return (
    <div className={cn('cc-icons', className)}>
      <MiniButton
        title='Структура типизации'
        icon={<IconTypeGraph size='1.25rem' className='hover:text-primary' />}
        onClick={handleTypeGraph}
        disabled={!activeCst?.analysis.type}
      />
      <MiniButton
        title='Структура выражения'
        onClick={handleShowAST}
        icon={<IconTree size='1.25rem' className='hover:text-primary' />}
        disabled={!activeCst}
      />
    </div>
  );
}
