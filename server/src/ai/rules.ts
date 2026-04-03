import { CATEGORIES } from '@hezhang/shared';

// Build keyword -> category map
const keywordMap = new Map<string, string>();
for (const cat of CATEGORIES) {
  for (const kw of cat.keywords) {
    keywordMap.set(kw, cat.name);
  }
}

/**
 * Layer 1: Rule-based keyword classification (<50ms)
 * Returns category name if matched, null otherwise
 */
export function classifyByRules(text: string): string | null {
  // Direct keyword match - check longest keywords first
  const keywords = [...keywordMap.keys()].sort((a, b) => b.length - a.length);

  for (const kw of keywords) {
    if (text.includes(kw)) {
      return keywordMap.get(kw)!;
    }
  }

  return null;
}
