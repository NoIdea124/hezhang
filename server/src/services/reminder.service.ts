import db from '../db/index.js';
import type { Reminder } from '@hezhang/shared';

export function getUnreadReminders(userId: string): Reminder[] {
  return db.prepare(`
    SELECT r.*, u.nickname as from_nickname
    FROM reminders r
    JOIN users u ON r.from_user_id = u.id
    WHERE r.to_user_id = ? AND r.is_read = 0
    ORDER BY r.created_at DESC
  `).all(userId) as Reminder[];
}

export function createReminder(spaceId: string, fromUserId: string, toUserId: string, content: string): Reminder {
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO reminders (id, space_id, from_user_id, to_user_id, content) VALUES (?, ?, ?, ?, ?)'
  ).run(id, spaceId, fromUserId, toUserId, content);

  return db.prepare(`
    SELECT r.*, u.nickname as from_nickname
    FROM reminders r
    JOIN users u ON r.from_user_id = u.id
    WHERE r.id = ?
  `).get(id) as Reminder;
}

export function markAsRead(id: string, userId: string): boolean {
  const result = db.prepare(
    'UPDATE reminders SET is_read = 1 WHERE id = ? AND to_user_id = ?'
  ).run(id, userId);
  return result.changes > 0;
}
