declare const brand: unique symbol;

/** Branded strict type. No runtime consequences. */
export type Branded<T, BrandT> = T & {
  readonly [brand]: BrandT;
};
