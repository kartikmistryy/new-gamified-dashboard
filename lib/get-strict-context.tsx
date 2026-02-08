import { createContext, useContext } from 'react';

/**
 * Creates a type-safe context that throws at runtime if used outside its provider.
 * Eliminates null checks at every call site.
 *
 * @example
 * const [MyContext, useMyContext] = getStrictContext<MyValue>('MyContext');
 */
export function getStrictContext<T>(displayName: string) {
  const context = createContext<T | null>(null);
  context.displayName = displayName;

  function useStrictContext() {
    const value = useContext(context);
    if (value === null) {
      throw new Error(`use${displayName} must be used within ${displayName}Provider`);
    }
    return value;
  }

  return [context, useStrictContext] as const;
}
