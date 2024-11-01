/**
 * Utility types shared across the workspace
 */

export type Nullable<T> = T | null;

// I have no idea what I'm doing but this appears to work
// T extends null will result in "boolean" instead of true for some reason (perhaps because T extends unknown | null??)
// but false works just fine, so we check for that and "force" the "boolean" into a "true"
export type IsNotNullable<T> = (T extends null ? true : false) extends false
  ? true
  : false;

export type OneOf<T> = {
  [K in keyof T]: Pick<T, K>;
}[keyof T];
