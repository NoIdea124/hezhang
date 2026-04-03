import db from '../db/index.js';
import type { User } from '@hezhang/shared';

const MOCK_CODE = '123456';

export function sendCode(_phone: string): boolean {
  // MVP: always succeed, code is 123456
  return true;
}

export function verifyCode(_phone: string, code: string): boolean {
  return code === MOCK_CODE;
}

export function upsertUser(phone: string, nickname?: string): User {
  const existing = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as User | undefined;

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  const defaultNickname = nickname || `用户${phone.slice(-4)}`;

  db.prepare(
    'INSERT INTO users (id, phone, nickname) VALUES (?, ?, ?)'
  ).run(id, phone, defaultNickname);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
}

export function getUserById(id: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function updateNickname(id: string, nickname: string): User | undefined {
  db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, id);
  return getUserById(id);
}
