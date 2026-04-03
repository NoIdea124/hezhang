export function formatCurrency(amount: number): string {
  return `¥${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}
