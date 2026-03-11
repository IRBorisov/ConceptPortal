'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuth } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { RSEditState } from '@/features/rsform/pages/rsform-page/rsedit-state';
import { type CalculatorResult } from '@/features/rslang';
import { type Value } from '@/features/rslang/eval/value';
import { normalizeType } from '@/features/rslang/labels';
import { useRoleStore, UserRole } from '@/features/users';

import { infoMsg, promptText } from '@/utils/labels';

import { RSModelLoader } from '../../backend/rsmodel-loader';
import { useClearValues } from '../../backend/use-clear-values';
import { useRSModel } from '../../backend/use-rsmodel';
import { useSetValue } from '../../backend/use-set-value';
import { type BasicBinding, EvalStatus } from '../../models/rsmodel';
import {
  getEvaluationFor,
  inferStatus,
  isInferrable,
  prepareEvaluation,
  recalculateModel
} from '../../models/rsmodel-api';

import { RSModelContext } from './rsmodel-context';

interface RSModelStateProps {
  itemID: number;
}

export const RSModelState = ({ itemID, children }: React.PropsWithChildren<RSModelStateProps>) => {
  const router = useConceptNavigation();
  const { model: modelData } = useRSModel({ itemID: itemID });
  const { user } = useAuth();
  const { schema } = useRSForm({ itemID: modelData.schema });
  // TODO: do not recreate model on every change
  const model = useMemo(() => new RSModelLoader(modelData, schema).produce(), [modelData, schema]);

  const [calculatedList, setCalculatedList] = useState<number[]>([]);

  const role = useRoleStore(state => state.role);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const isMutable = role > UserRole.READER && !schema.read_only;
  const isOwned = !!user.id && user.id === model.owner;

  const setCurrentModel = useAIStore(state => state.setModel);
  const { deleteItem } = useDeleteItem();
  const { setCstValue } = useSetValue();
  const { clearValues } = useClearValues();

  useEffect(() => {
    setCurrentModel(model);
    return () => setCurrentModel(null);
  }, [model, setCurrentModel]);

  function deleteModel() {
    if (!window.confirm(promptText.deleteLibraryItem)) {
      return;
    }
    void deleteItem({
      target: model.id,
      beforeInvalidate: () => {
        if (searchLocation === model.location) {
          setSearchLocation('');
        }
        return router.pushAsync({ path: urls.library, force: true });
      }
    });
  }

  function getEvalStatus(cstID: number): EvalStatus {
    const cst = schema.cstByID.get(cstID);
    if (!cst) {
      return EvalStatus.NO_EVAL;
    }
    const value = model.calculator.getValue(cst.alias);
    return inferStatus(value, cst.cst_type, calculatedList.includes(cstID));
  }

  function getCstValue(cstID: number): Value | null {
    const cst = schema.cstByID.get(cstID);
    if (!cst) {
      return null;
    }
    return model.calculator.getValue(cst.alias);
  }

  function setValue(cstID: number, data: Value): void {
    const cst = schema.cstByID.get(cstID);
    if (!cst) {
      return;
    }
    const type = cst.analysis.type;
    // TODO: check for cascade updates

    const payload = [{ target: cstID, type: normalizeType(type), data: data }];
    void setCstValue({ itemID: model.id, data: payload }).then(() => {
      model.calculator.setValue(cst.alias, data);
    });
  }

  function setBasicValue(cstID: number, data: BasicBinding): void {
    const cst = schema.cstByID.get(cstID);
    if (!cst) {
      return;
    }
    // TODO: check for cascade updates

    const payload = [{ target: cstID, type: 'basic', data: data }];
    void setCstValue({ itemID: model.id, data: payload }).then(() => {
      model.basicsContext.set(cstID, data);
      model.calculator.setValue(cst.alias, Object.keys(data).map(Number));
    });
  }

  function resetValue(cstID: number): void {
    const cst = schema.cstByID.get(cstID);
    if (!cst) {
      return;
    }
    // TODO: check for cascade resets
    void clearValues({ itemID: model.id, data: { items: [cstID] } }).then(() => {
      model.calculator.resetValue(cst.alias);
      model.basicsContext.delete(cstID);
    });
  }

  function calculateCst(cstID: number): CalculatorResult {
    const cst = schema.cstByID.get(cstID);
    if (!cst || !isInferrable(cst.cst_type)) {
      return { value: null, iterations: 0, errors: [] };
    }

    if (!calculatedList.includes(cstID)) {
      const newCalculated = prepareEvaluation(cstID, schema, model);
      newCalculated.push(cstID);
      setCalculatedList(Array.from(new Set([...calculatedList, ...newCalculated])));
    }

    const result = getEvaluationFor(cst.definition_formal, cst.cst_type, schema, model);
    if (result.value === null) {
      model.calculator.resetValue(cst.alias);
    } else {
      model.calculator.setValue(cst.alias, result.value);
    }
    return result;

  }

  function recalculateAll() {
    const startTime = performance.now();

    setCalculatedList([]);
    let newList = [];
    newList = recalculateModel(schema, model);
    setCalculatedList(newList);

    const endTime = performance.now();
    const timeSpent = ((endTime - startTime) / 1000).toFixed(2);
    toast.success(infoMsg.calculationSuccess(timeSpent));
  }

  return (
    <RSModelContext
      value={{
        model,
        isMutable,
        isOwned,

        setValue,
        setBasicValue,
        resetValue,
        calculateCst,
        getEvalStatus,
        getCstValue,

        deleteModel,
        recalculateAll,
      }}
    >
      <RSEditState itemID={model.schema}>
        {children}
      </RSEditState>
    </RSModelContext>
  );
};
