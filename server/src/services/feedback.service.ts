import db from '../db/index.js';
import type { Feedback } from '@hezhang/shared';

export function getAllFeedback(): Feedback[] {
  return db.prepare(`
    SELECT f.id, f.user_id, f.content, f.created_at
    FROM feedback f
    ORDER BY f.created_at DESC
  `).all() as Feedback[];
}

export function createFeedback(userId: string, content: string): Feedback {
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO feedback (id, user_id, content) VALUES (?, ?, ?)'
  ).run(id, userId, content);

  return db.prepare(`
    SELECT f.id, f.user_id, f.content, f.created_at
    FROM feedback f
    WHERE f.id = ?
  `).get(id) as Feedback;
}

export function deleteFeedback(id: string): boolean {
  const result = db.prepare('DELETE FROM feedback WHERE id = ?').run(id);
  return result.changes > 0;
}
