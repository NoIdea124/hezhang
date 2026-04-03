export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function formatDate(dateStr: string): string {
  const today = new Date();
  const date = new Date(dateStr + 'T00:00:00');

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  if (dateStr === todayStr) return '今天';
  if (dateStr === yesterdayStr) return '昨天';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === today.getFullYear()) {
    return `${month}月${day}日`;
  }
  return `${year}年${month}月${day}日`;
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}
