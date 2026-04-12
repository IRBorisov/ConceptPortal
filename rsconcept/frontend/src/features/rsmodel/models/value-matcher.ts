import { TypeID, type Typification, type Value } from '@/domain/rslang';
import { TextMatcher } from '@/utils/utils';

import { type RSEngine } from './rsengine';

/** Utility for matching Values against a query. */
export class ValueMatcher {
  private engine: RSEngine;
  private allowedBinding = new Map<string, number[]>();
  private matcher: TextMatcher;

  constructor(engine: RSEngine, query: string) {
    this.engine = engine;
    this.matcher = new TextMatcher(query);
    this.prepareBindings();
  }

  private prepareBindings() {
    for (const [cstID, binding] of this.engine.basics.entries()) {
      const cst = this.engine.schema?.cstByID.get(cstID);
      if (!cst) {
        continue;
      }
      const matchedIDs: number[] = [];
      for (const [key, value] of Object.entries(binding)) {
        if (this.matcher.test(value)) {
          matchedIDs.push(Number(key));
        }
      }
      this.allowedBinding.set(cst.alias, matchedIDs);
    }
  }

  public match(value: Value, type: Typification): boolean {
    switch (type.typeID) {
      case TypeID.integer:
        return this.matcher.test(String(value as number));
      case TypeID.anyTypification:
        return false;
      case TypeID.basic:
        return this.allowedBinding.get(type.baseID)?.includes(value as number) ?? false;
      case TypeID.collection:
        for (const item of value as Value[]) {
          if (this.match(item, type.base)) {
            return true;
          }
        }
        return false;
      case TypeID.tuple:
        for (let i = 0; i < type.factors.length; i++) {
          if (this.match((value as Value[])[i + 1], type.factors[i])) {
            return true;
          }
        }
        return false;
    }
  }
}
