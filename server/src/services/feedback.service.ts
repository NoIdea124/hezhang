import db from '../db/index.js';
import type { Feedback } from '@hezhang/shared';

export function getAllFeedback(): Feedback[] {
  return db.prepare(`
    SELECT f.*, u.nickname as user_nickname
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all() as Feedback[];
}

export function createFeedback(userId: string, content: string): Feedback {
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO feedback (id, user_id, content) VALUES (?, ?, ?)'
  ).run(id, userId, content);

  return db.prepare(`
    SELECT f.*, u.nickname as user_nickname
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    WHERE f.id = ?
  `).get(id) as Feedback;
}
