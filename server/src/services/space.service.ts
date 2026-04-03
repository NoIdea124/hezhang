import db from '../db/index.js';
import type { Space, SpaceMember } from '@hezhang/shared';
import { generateInviteCode } from '../utils/invite-code.js';

export function createSpace(userId: string, name?: string): Space {
  const id = crypto.randomUUID();
  const inviteCode = generateInviteCode();
  const spaceName = name || '我们的小家';

  db.prepare(
    'INSERT INTO spaces (id, name, invite_code, created_by) VALUES (?, ?, ?, ?)'
  ).run(id, spaceName, inviteCode, userId);

  db.prepare(
    'INSERT INTO space_members (space_id, user_id, role) VALUES (?, ?, ?)'
  ).run(id, userId, 'owner');

  return db.prepare('SELECT * FROM spaces WHERE id = ?').get(id) as Space;
}

export function joinSpace(userId: string, inviteCode: string): Space | null {
  const space = db.prepare(
    'SELECT * FROM spaces WHERE invite_code = ?'
  ).get(inviteCode) as Space | undefined;

  if (!space) return null;

  // Check if already a member
  const existing = db.prepare(
    'SELECT * FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(space.id, userId);

  if (existing) return space;

  // Check member count (max 2)
  const count = db.prepare(
    'SELECT COUNT(*) as cnt FROM space_members WHERE space_id = ?'
  ).get(space.id) as { cnt: number };

  if (count.cnt >= 2) return null;

  db.prepare(
    'INSERT INTO space_members (space_id, user_id, role) VALUES (?, ?, ?)'
  ).run(space.id, userId, 'member');

  return space;
}

export function getUserSpace(userId: string): Space | null {
  const row = db.prepare(`
    SELECT s.* FROM spaces s
    JOIN space_members sm ON s.id = sm.space_id
    WHERE sm.user_id = ?
    LIMIT 1
  `).get(userId) as Space | undefined;

  return row ?? null;
}

export function getSpaceMembers(spaceId: string): SpaceMember[] {
  return db.prepare(`
    SELECT sm.*, u.nickname, u.avatar_url
    FROM space_members sm
    JOIN users u ON sm.user_id = u.id
    WHERE sm.space_id = ?
  `).all(spaceId) as SpaceMember[];
}

export function updateSpaceName(spaceId: string, userId: string, name: string): Space | null {
  const member = db.prepare(
    'SELECT role FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(spaceId, userId) as { role: string } | undefined;

  if (!member || member.role !== 'owner') return null;

  db.prepare('UPDATE spaces SET name = ? WHERE id = ?').run(name, spaceId);
  return db.prepare('SELECT * FROM spaces WHERE id = ?').get(spaceId) as Space;
}
