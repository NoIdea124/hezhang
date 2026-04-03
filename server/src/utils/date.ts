// Parse Chinese date expressions to actual date strings

export function parseChineseDate(text: string): string {
  const today = new Date();

  // Absolute dates: "3月25号", "3月25日", "4月2日"
  // Use [月] only (not dot) to avoid matching decimal amounts like "23.5"
  const absMatch = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[号日]?/);
  if (absMatch) {
    const month = parseInt(absMatch[1]);
    const day = parseInt(absMatch[2]);
    let year = today.getFullYear();
    // If the date is in the future, use last year
    const candidate = new Date(year, month - 1, day);
    if (candidate > today) {
      year--;
    }
    return formatDate(new Date(year, month - 1, day));
  }

  // "上个月25号"
  const lastMonthMatch = text.match(/上个?月\s*(\d{1,2})\s*[号日]?/);
  if (lastMonthMatch) {
    const day = parseInt(lastMonthMatch[1]);
    const d = new Date(today);
    d.setMonth(d.getMonth() - 1);
    d.setDate(day);
    return formatDate(d);
  }

  // Relative dates
  if (text.includes('前天')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    return formatDate(d);
  }

  if (text.includes('昨天')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  }

  if (text.includes('今天') || text.includes('刚才') || text.includes('刚刚')) {
    return formatDate(today);
  }

  // "上周X"
  const weekdayMap: Record<string, number> = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0,
  };
  const weekMatch = text.match(/上\s*(?:个?)\s*(?:周|星期|礼拜)\s*([一二三四五六日天])/);
  if (weekMatch) {
    const targetDay = weekdayMap[weekMatch[1]] ?? 0;
    const d = new Date(today);
    const currentDay = d.getDay();
    let diff = currentDay - targetDay;
    if (diff <= 0) diff += 7;
    diff += 7; // go back one more week since it's "上周"
    // Actually: if diff > 7, that means it's more than a week, adjust
    d.setDate(d.getDate() - diff);
    // Simpler approach: go back to last week
    const daysBack = currentDay + 7 - targetDay;
    d.setDate(today.getDate() - daysBack);
    return formatDate(d);
  }

  // No date keyword found -> default to today
  return formatDate(today);
}

// Check if text contains any date keyword
export function hasDateKeyword(text: string): boolean {
  return /(?:今天|昨天|前天|上周|上个?月|星期|礼拜|\d+月\d+[号日]|\d+\.\d+)/.test(text);
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
