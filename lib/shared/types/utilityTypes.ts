/**
 * Reusable utility types for the codebase.
 *
 * These generic type helpers reduce boilerplate and improve
 * type safety across the application.
 */

/**
 * Make all properties and nested properties readonly (deep)
 *
 * @example
 * ```typescript
 * type Config = DeepReadonly<{
 *   api: { url: string; timeout: number };
 *   features: { darkMode: boolean };
 * }>;
 * // All properties are readonly, including nested ones
 * ```
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

/**
 * Extract keys of an object that have values of a specific type
 *
 * @example
 * ```typescript
 * type Person = { name: string; age: number; active: boolean };
 * type StringKeys = KeysOfType<Person, string>; // "name"
 * type NumberKeys = KeysOfType<Person, number>; // "age"
 * ```
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Make specific keys required while keeping others as-is
 *
 * @example
 * ```typescript
 * type User = { id?: string; name?: string; email?: string };
 * type UserWithId = RequireKeys<User, "id">; // id is required, others optional
 * ```
 */
export type RequireKeys<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Make specific keys optional while keeping others as-is
 *
 * @example
 * ```typescript
 * type User = { id: string; name: string; email: string };
 * type UserUpdate = OptionalKeys<User, "name" | "email">; // id required, others optional
 * ```
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Extract function parameter types as a tuple
 *
 * @example
 * ```typescript
 * function greet(name: string, age: number) { }
 * type Params = ParamsOf<typeof greet>; // [string, number]
 * ```
 */
export type ParamsOf<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

/**
 * Extract function return type
 *
 * @example
 * ```typescript
 * function getUser(): { name: string; id: number } { }
 * type User = ReturnTypeOf<typeof getUser>; // { name: string; id: number }
 * ```
 */
export type ReturnTypeOf<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : never;

/**
 * Create a type with all properties of T except those in K set to never
 * Useful for creating "exactly one of" type unions
 *
 * @example
 * ```typescript
 * type A = { type: "a"; valueA: string };
 * type B = { type: "b"; valueB: number };
 * type AOnly = ExclusiveOr<A, B>; // Either A or B, not both
 * ```
 */
export type Without<T, K> = {
  [P in Exclude<keyof T, keyof K>]?: never;
};

/**
 * Exclusive OR type - exactly one of T or U
 */
export type ExclusiveOr<T, U> = (T | U) extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

/**
 * Make a type nullable (allow null and undefined)
 */
export type Nullable<T> = T | null | undefined;

/**
 * Make a type non-nullable (remove null and undefined)
 */
export type NonNullable<T> = Exclude<T, null | undefined>;

/**
 * Flatten a type to show its resolved structure
 * Useful for debugging complex conditional types
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Create a union of all possible paths in an object type
 *
 * @example
 * ```typescript
 * type Obj = { user: { name: string; address: { city: string } } };
 * type Paths = ObjectPath<Obj>;
 * // "user" | "user.name" | "user.address" | "user.address.city"
 * ```
 */
export type ObjectPath<T, Prefix extends string = ""> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ? `${Prefix}${K}` | ObjectPath<T[K], `${Prefix}${K}.`>
      : `${Prefix}${K}`
    : never;
}[keyof T];

/**
 * Get the value type at a specific path in an object
 *
 * @example
 * ```typescript
 * type Obj = { user: { name: string; age: number } };
 * type UserName = ValueAtPath<Obj, "user.name">; // string
 * ```
 */
export type ValueAtPath<
  T,
  Path extends string
> = Path extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? ValueAtPath<T[K], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;
