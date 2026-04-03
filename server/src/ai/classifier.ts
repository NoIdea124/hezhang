import { classifyByRules } from './rules.js';
import { chatCompletion } from './deepseek.js';
import { getClassifyPrompt } from './prompts.js';
import { CATEGORIES } from '@hezhang/shared';
import { getCustomCategories } from '../services/category.service.js';

/**
 * Two-layer classification:
 * Layer 1: keyword rules (<50ms)
 * Layer 2: LLM semantic classification (<2s)
 */
export async function classify(text: string, spaceId?: string): Promise<string> {
  // Build valid categories set including custom ones
  const validCategories = new Set(CATEGORIES.map((c) => c.name));
  let categoryList = CATEGORIES.map((c) => c.name).join('、');

  if (spaceId) {
    const custom = getCustomCategories(spaceId);
    for (const c of custom) {
      validCategories.add(c.name);
    }
    if (custom.length > 0) {
      categoryList = [...CATEGORIES.map((c) => c.name), ...custom.map((c) => c.name)].join('、');
    }
  }

  // Layer 1: rules
  const ruleResult = classifyByRules(text);
  if (ruleResult) return ruleResult;

  // Layer 2: LLM
  try {
    const prompt = getClassifyPrompt(categoryList);
    const llmResult = await chatCompletion(prompt, text);
    const cleaned = llmResult.trim();
    if (validCategories.has(cleaned)) {
      return cleaned;
    }
  } catch (e) {
    console.error('LLM classification failed:', e);
  }

  return '其他';
}
