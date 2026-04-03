'use client';

import { useEffect, useState, useCallback } from 'react';
import { CATEGORIES } from '@hezhang/shared';
import type { Category } from '@hezhang/shared';
import type { CustomCategory } from '@hezhang/shared';
import { apiFetch } from '@/lib/api';

interface UseCategoriesResult {
  categories: Category[];
  custom: CustomCategory[];
  loading: boolean;
  refetch: () => void;
}

export function useCategories(): UseCategoriesResult {
  const [custom, setCustom] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await apiFetch<{ builtin: Category[]; custom: CustomCategory[] }>('/categories');
      setCustom(res.custom);
    } catch {
      // fallback to builtin only
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Merge: builtin (except 其他) + custom + 其他
  const otherIdx = CATEGORIES.findIndex((c) => c.name === '其他');
  const builtinWithoutOther = otherIdx >= 0 ? CATEGORIES.slice(0, otherIdx) : CATEGORIES;
  const otherCat = otherIdx >= 0 ? CATEGORIES[otherIdx] : null;

  const customAsCat: Category[] = custom.map((c) => ({
    name: c.name,
    icon: c.icon,
    keywords: [],
  }));

  const categories = [
    ...builtinWithoutOther,
    ...customAsCat,
    ...(otherCat ? [otherCat] : []),
  ];

  return { categories, custom, loading, refetch };
}
