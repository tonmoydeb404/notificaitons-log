import {useCallback, useMemo, useState} from 'react';
import {SearchFilters} from '../types';

export const useSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({query: ''});
  const [isActive, setIsActive] = useState(false);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setIsActive(
      newFilters.query.length > 0 ||
        newFilters.appName !== undefined ||
        newFilters.isRead !== undefined ||
        newFilters.dateRange !== undefined,
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({query: ''});
    setIsActive(false);
  }, []);

  const hasActiveFilters = useMemo(() => isActive, [isActive]);

  return {
    filters,
    hasActiveFilters,
    updateFilters,
    clearFilters,
  };
};
