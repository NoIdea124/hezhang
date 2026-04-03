import db from '../db/index.js';
import { CATEGORIES } from '@hezhang/shared';
import type { CustomCategory } from '@hezhang/shared';

const builtinNames = new Set(CATEGORIES.map((c) => c.name));

export function getCustomCategories(spaceId: string): CustomCategory[] {
  return db.prepare(
    'SELECT * FROM custom_categories WHERE space_id = ? ORDER BY created_at'
  ).all(spaceId) as CustomCategory[];
}

export function addCustomCategory(spaceId: string, name: string, icon: string): CustomCategory {
  const trimmedName = name.trim();
  const trimmedIcon = icon.trim() || '📦';

  if (!trimmedName || trimmedName.length > 8) {
    throw new Error('分类名称1-8个字符');
  }
  if (builtinNames.has(trimmedName)) {
    throw new Error('不能与内置分类重名');
  }

  const count = db.prepare(
    'SELECT COUNT(*) as cnt FROM custom_categories WHERE space_id = ?'
  ).get(spaceId) as { cnt: number };
  if (count.cnt >= 20) {
    throw new Error('最多添加20个自定义分类');
  }

  const id = crypto.randomUUID();
  try {
    db.prepare(
      'INSERT INTO custom_categories (id, space_id, name, icon) VALUES (?, ?, ?, ?)'
    ).run(id, spaceId, trimmedName, trimmedIcon);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      throw new Error('该分类已存在');
    }
    throw e;
  }

  return db.prepare('SELECT * FROM custom_categories WHERE id = ?').get(id) as CustomCategory;
}

export function deleteCustomCategory(id: string, spaceId: string): boolean {
  const result = db.prepare(
    'DELETE FROM custom_categories WHERE id = ? AND space_id = ?'
  ).run(id, spaceId);
  return result.changes > 0;
}
