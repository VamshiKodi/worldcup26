import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export type QueryParams = Record<string, string | number | boolean | undefined>;

interface ApiResult<T> {
  body: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Strip undefined/empty params so they don't hit the API as `?x=` and break Zod enums. */
function cleanParams(params?: QueryParams): QueryParams | undefined {
  if (!params) return undefined;
  const out: QueryParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') out[k] = v;
  }
  return out;
}

/**
 * Generic GET hook. Returns the full response envelope as `body` so callers can
 * read both `body.data` and pagination meta. Refetches whenever path/params change;
 * stale responses from superseded requests are discarded.
 */
export function useApi<T>(path: string, params?: QueryParams): ApiResult<T> {
  const [body, setBody] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const key = JSON.stringify({ path, params: cleanParams(params) });
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);

    api
      .get<T>(path, { params: cleanParams(params) })
      .then((res) => {
        if (id === reqId.current) {
          setBody(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        const msg =
          err?.response?.data?.error?.message ?? err?.message ?? 'Failed to load data';
        setError(msg);
        setLoading(false);
      });
    // key encodes path + params; nonce forces a manual refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { body, loading, error, refetch };
}
