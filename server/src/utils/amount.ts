// Amount extraction from Chinese text
// Supports: "68", "68元", "68块", "¥68", "68.5", "6800"
export function extractAmount(text: string): number | null {
  // Match patterns like ¥68, 68元, 68块, 68.5, plain numbers
  const patterns = [
    /[¥￥](\d+(?:\.\d{1,2})?)/,
    /(\d+(?:\.\d{1,2})?)\s*(?:元|块|块钱|圆)/,
    /(\d+(?:\.\d{1,2})?)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (num > 0 && num < 1000000) {
        return num;
      }
    }
  }

  return null;
}

// Remove amount from text to get the description
export function removeAmount(text: string): string {
  return text
    .replace(/[¥￥]\d+(?:\.\d{1,2})?/, '')
    .replace(/\d+(?:\.\d{1,2})?\s*(?:元|块|块钱|圆)/, '')
    .replace(/\d+(?:\.\d{1,2})?/, '')
    .trim();
}
