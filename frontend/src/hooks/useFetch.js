import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook useFetch
 * Maneja de forma unificada los estados de carga (loading), error y datos (data),
 * con capacidad de re-ejecución mediante refetch.
 *
 * @param {Function} fetcherFn - Función asíncrona que retorna datos
 * @param {Array} deps - Dependencias reactivas que disparan una nueva petición
 */
export function useFetch(fetcherFn, deps = [], initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar la información');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export default useFetch;
