'use client';

import { toast } from 'react-toastify';

import { type ExpressionType } from '@/domain/rslang';
import { rslangParser } from '@/domain/rslang';

import {
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '@/features/rsform/backend/types';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { MiniButton } from '@/components/control';
import { IconTree, IconTypeGraph } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { buildTree, flattenAst } from '@/utils/parsing';

interface ToolbarExpressionProps {
  className?: string;
  expression: string;
  type: ExpressionType | null;
  activeCstId?: number;
  extractionDisabled?: boolean;
  onCreateCst?: (data: CreateConstituentaDTO) => Promise<RO<ConstituentaCreatedResponse>>;
  onUpdateCst?: (data: UpdateConstituentaDTO) => Promise<RO<RSFormDTO>>;
}

export function ToolbarExpression({
  className,
  expression,
  type,
  activeCstId,
  extractionDisabled,
  onCreateCst,
  onUpdateCst
}: ToolbarExpressionProps) {
  const { schema } = useSchemaEdit();

  const showFlatAst = useDialogsStore(state => state.showShowFlatAst);
  const showAstExtract = useDialogsStore(state => state.showShowAstExtract);
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);

  function handleShowAST(event: React.MouseEvent<Element>) {
    if (event.ctrlKey || event.metaKey) {
      const tree = rslangParser.parse(expression);
      const ast = buildTree(tree.cursor());
      showFlatAst({
        ast: flattenAst(ast),
        expression,
        schema
      });
      return;
    }
    const parse = schema.analyzer.checkFull(expression, { annotateTypes: true, annotateErrors: true });
    if (!parse.ast) {
      toast.error(errorMsg.invalidParse);
      return;
    }
    const canExtract =
      !parse.ast.hasError &&
      !extractionDisabled &&
      onCreateCst &&
      onUpdateCst &&
      activeCstId != null;

    if (canExtract) {
      showAstExtract({
        initial: {
          ast: parse.ast,
          expression,
          schema
        },
        targetID: activeCstId,
        onCreate: onCreateCst,
        onUpdate: onUpdateCst
      });
    } else {
      showFlatAst({
        ast: flattenAst(parse.ast),
        expression,
        schema
      });
    }
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
