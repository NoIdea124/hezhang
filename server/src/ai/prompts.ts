export function getClassifyPrompt(categoryList: string): string {
  return `你是一个家庭消费分类助手。根据用户的消费描述，返回最匹配的分类。
可选分类: ${categoryList}
只返回分类名称，不要解释。`;
}

export function getParsePrompt(categoryList: string): string {
  return `你是一个智能记账助手。根据用户输入，提取消费信息并返回JSON格式。

规则：
1. 提取金额（数字）
2. 提取消费描述（作为note）
3. 推断分类（可选：${categoryList}）
4. 推断日期（无日期词默认"今天"；支持"昨天""前天""上周五""3月25号"等）
5. 推断归属（默认"shared"，用户说"个人的""算我个人"则为"personal"）

只返回JSON，格式：
{"amount":数字,"category":"分类","note":"描述","date_offset":"today|yesterday|具体日期","ownership":"shared或personal"}`;
}

// Keep old exports for backward compatibility with intent (no dynamic categories needed)
export const CLASSIFY_PROMPT = getClassifyPrompt('餐饮、交通、日用品、住房、娱乐、医疗、服饰、宠物、人情、教育、其他');

export const PARSE_PROMPT = getParsePrompt('餐饮、交通、日用品、住房、娱乐、医疗、服饰、宠物、人情、教育、其他');

export const INTENT_PROMPT = `你是一个智能记账助手的意图识别模块。根据用户输入判断意图。

可选意图：
- record: 记录一笔消费（包含金额和描述）
- query_spending: 查询消费总额（"花了多少""还剩多少"）
- query_expenses: 查询消费记录（"最近几笔""看看消费"）
- modify: 修改记录（"改成""上一笔改为"）
- delete: 删除记录（"删掉""撤销上一笔"）
- set_budget: 设定预算（"设预算""下个月预算"）
- view_report: 查看报告（"看报告""这个月情况"）
- help: 闲聊或帮助

只返回意图名称，不要解释。`;
