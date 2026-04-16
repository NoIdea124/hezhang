import db from '../db/index.js';
import type { MembershipCard, MembershipCardCreate, MembershipCardUpdate } from '@hezhang/shared';

export function getCards(spaceId: string): MembershipCard[] {
  const rows = db.prepare(`
    SELECT mc.*, u.nickname as user_nickname
    FROM membership_cards mc
    JOIN users u ON mc.user_id = u.id
    WHERE mc.space_id = ?
    ORDER BY mc.updated_at DESC
  `).all(spaceId) as MembershipCard[];
  return rows;
}

export function getCardById(id: string): MembershipCard | null {
  const row = db.prepare(`
    SELECT mc.*, u.nickname as user_nickname
    FROM membership_cards mc
    JOIN users u ON mc.user_id = u.id
    WHERE mc.id = ?
  `).get(id) as MembershipCard | undefined;
  return row || null;
}

export function createCard(spaceId: string, userId: string, data: MembershipCardCreate): MembershipCard {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO membership_cards (id, space_id, user_id, store_name, balance, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, spaceId, userId, data.store_name, data.balance, data.note || '', now, now);

  return getCardById(id)!;
}

export function updateCard(id: string, data: MembershipCardUpdate): MembershipCard | null {
  const existing = getCardById(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: any[] = [];

  if (data.store_name !== undefined) { sets.push('store_name = ?'); params.push(data.store_name); }
  if (data.balance !== undefined) { sets.push('balance = ?'); params.push(data.balance); }
  if (data.note !== undefined) { sets.push('note = ?'); params.push(data.note); }

  if (sets.length === 0) return existing;

  sets.push("updated_at = datetime('now')");
  params.push(id);

  db.prepare(`UPDATE membership_cards SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  return getCardById(id);
}

export function deleteCard(id: string): boolean {
  const result = db.prepare('DELETE FROM membership_cards WHERE id = ?').run(id);
  return result.changes > 0;
}
