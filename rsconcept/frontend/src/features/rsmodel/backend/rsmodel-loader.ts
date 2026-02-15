import { CstType, type RSForm } from '@/features/rsform';
import { getAnalysisFor, isBasicConcept, isFunctional } from '@/features/rsform/models/rsform-api';
import { RSCalculator, TypeID, type Value, } from '@/features/rslang';

import { type RO } from '@/utils/meta';

import { type BasicBinding, type BasicsContext, type RSModel, TYPE_BASIC } from '../models/rsmodel';

import { type RSModelDTO } from './types';

export class RSModelLoader {
  private data: RO<RSModelDTO>;
  private schema: RSForm;
  private basicsContext: BasicsContext = new Map<number, BasicBinding>();
  private calculator: RSCalculator = new RSCalculator();

  constructor(input: RO<RSModelDTO>, schema: RSForm) {
    this.schema = schema;
    this.data = input;
  }

  produce(): RSModel {
    this.prepareAst();
    this.prepareValues();
    return {
      id: this.data.id,
      item_type: this.data.item_type,
      title: this.data.title,
      alias: this.data.alias,
      description: this.data.description,
      owner: this.data.owner,
      visible: this.data.visible,
      read_only: this.data.read_only,
      access_policy: this.data.access_policy,
      location: this.data.location,
      time_create: this.data.time_create,
      time_update: this.data.time_update,
      editors: [...this.data.editors],

      schema: this.schema,
      basicsContext: this.basicsContext,
      calculator: this.calculator
    };
  }

  private prepareAst(): void {
    const functions = this.schema.items.filter(cst => isFunctional(cst.cst_type) && cst.analysis?.success);
    for (const cst of functions) {
      const fullAnalysis = getAnalysisFor(cst.definition_formal, cst.cst_type, this.schema);
      if (fullAnalysis.ast) {
        this.calculator.setAST(cst.alias, fullAnalysis.ast);
      }
    }
  }

  private prepareValues(): void {
    for (const item of this.data.items) {
      const cst = this.schema.cstByID.get(item.id)!;
      if (item.type === TYPE_BASIC) {
        if (cst.cst_type !== CstType.BASE && cst.cst_type !== CstType.CONSTANT) {
          throw new Error(`Invalid data for ${cst.alias}`);
        }
        const data = item.value as BasicBinding;
        this.basicsContext.set(cst.id, data);
        this.calculator.setValue(cst.alias, Object.keys(data).map(Number));
      } else {
        // TODO: check typification
        this.calculator.setValue(cst.alias, item.value as Value);
      }
    }
    for (const cst of this.schema.items) {
      if (isBasicConcept(cst.cst_type) && this.schema.analyzer.getType(cst.alias)?.typeID === TypeID.collection) {
        if (this.calculator.getValue(cst.alias) === null) {
          this.calculator.setValue(cst.alias, []);
        }
      }
    }
  }
}
