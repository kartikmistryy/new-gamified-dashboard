/** Multi Time Range Utility Hooks */

'use client';

import { useMemo } from 'react';
import type { TimeRangeKey } from './timeRangeTypes';
import { useMultiTimeRange } from './MultiTimeRangeContext';

/** Access multiple named ranges at once - convenience hook for components needing multiple ranges */
export function useMultipleNamedRanges(names: string[]): Record<string, TimeRangeKey> {
  const { getTimeRange } = useMultiTimeRange();

  return useMemo(() => {
    const result: Record<string, TimeRangeKey> = {};
    names.forEach((name) => {
      result[name] = getTimeRange(name);
    });
    return result;
  }, [names, getTimeRange]);
}
