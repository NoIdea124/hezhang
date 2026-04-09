/** Get current Beijing time as a Date (with UTC methods representing Beijing time) */
function getBeijingNow(): Date {
  return new Date(Date.now() + 8 * 3600_000);
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function formatDate(dateStr: string): string {
  const now = getBeijingNow();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now.getTime() - 86400_000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return '今天';
  if (dateStr === yesterdayStr) return '昨天';

  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === now.getUTCFullYear()) {
    return `${month}月${day}日`;
  }
  return `${year}年${month}月${day}日`;
}

export function getCurrentMonth(): string {
  return getBeijingNow().toISOString().slice(0, 7);
}

export function getToday(): string {
  return getBeijingNow().toISOString().split('T')[0];
}
