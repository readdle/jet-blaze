export type GuardType<TypeGuard> = TypeGuard extends (
  value: unknown,
) => value is infer Type
  ? Type
  : unknown;

export const hasProperty = <
  Obj,
  Prop extends string | number,
  TypeGuard extends (value: unknown) => value is unknown,
>(
  obj: Obj,
  prop: Prop,
  typeGuard?: TypeGuard,
): obj is Obj & { readonly [K in Prop]: GuardType<TypeGuard> } => {
  if (obj && typeof obj === "object" && prop in obj) {
    return !typeGuard ? true : typeGuard(obj[prop as unknown as keyof Obj]);
  }

  return false;
};
