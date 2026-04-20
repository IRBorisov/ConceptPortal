'use client';

import { toast } from 'react-toastify';

import { type ExpressionType } from '@/domain/rslang';

import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

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
  const { schema } = useSchemaEdit();

  const showFlatAst = useDialogsStore(state => state.showShowFlatAst);
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);

  function handleShowAST() {
    const parse = schema.analyzer.checkFull(expression, { annotateTypes: true, annotateErrors: true });
    if (!parse.ast) {
      toast.error(errorMsg.invalidParse);
      return;
    }
    const flatAst = flattenAst(parse.ast);
    showFlatAst({
      ast: flatAst,
      expression,
      schema
    });
  }

  function handleTypeGraph() {
    let targetType = type;
    if (!targetType) {
      const parse = schema.analyzer.checkFast(expression);
      targetType = parse.type;
    }
    if (!targetType) {
      toast.error(errorMsg.typeStructureFailed);
      return;
    }
    showTypification({ items: [{ alias: 'TARGET', type: targetType }] });
  }

  return (
    <div className={cn('cc-icons', className)}>
      <MiniButton
        title='Структура типизации'
        icon={<IconTypeGraph size='1.25rem' className='hover:text-primary' />}
        onClick={handleTypeGraph}
      />
      <MiniButton
        title='Структура выражения'
        onClick={handleShowAST}
        icon={<IconTree size='1.25rem' className='hover:text-primary' />}
      />
    </div>
  );
}
