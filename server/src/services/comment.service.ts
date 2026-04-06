import db from '../db/index.js';
import type { Comment } from '@hezhang/shared';

export function getComments(expenseId: string): Comment[] {
  return db.prepare(`
    SELECT c.*, u.nickname as user_nickname
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.expense_id = ?
    ORDER BY c.created_at ASC
  `).all(expenseId) as Comment[];
}

export function createComment(expenseId: string, userId: string, content: string): Comment {
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO comments (id, expense_id, user_id, content) VALUES (?, ?, ?, ?)'
  ).run(id, expenseId, userId, content);

  return db.prepare(`
    SELECT c.*, u.nickname as user_nickname
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(id) as Comment;
}
