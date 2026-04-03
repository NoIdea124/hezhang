import type { Intent } from '@hezhang/shared';

/**
 * Intent recognition - regex first, LLM fallback
 */
export function recognizeIntent(text: string): Intent {
  const t = text.trim();

  // Delete
  if (/(?:删掉|删除|撤销|取消)\s*(?:上一笔|最近一笔|这笔|那笔)?/.test(t)) {
    return 'delete';
  }

  // Modify
  if (/(?:改成|改为|修改|上一笔改|更正)/.test(t)) {
    return 'modify';
  }

  // Set budget (must be before query_budget since both match "预算")
  if (/(?:设[定置]?预算|下个?月预算)/.test(t)) {
    return 'set_budget';
  }

  // Query budget
  if (/(?:预算|还剩多少|剩多少|还有多少预算|预算还)/.test(t)) {
    return 'query_budget';
  }

  // View report
  if (/(?:报告|报表|月报|看看.*(?:情况|汇总)|总结)/.test(t)) {
    return 'view_report';
  }

  // Query spending
  if (/(?:花了多少|总共花|消费了多少|这个月花|本月花|支出多少|多少钱了)/.test(t)) {
    return 'query_spending';
  }

  // Query expenses
  if (/(?:最近.*[笔条]|查看.*消费|消费记录|看看.*消费|账单|流水)/.test(t)) {
    return 'query_expenses';
  }

  // Record: contains a number -> likely recording an expense
  if (/\d+(?:\.\d+)?/.test(t) && t.length > 1) {
    return 'record';
  }

  // Default: help
  return 'help';
}
