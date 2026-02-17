// Text processing utilities

/**
 * Calculate reading time based on word count
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 225
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Generate URL slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(keyword: string, text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  const keywordLower = keyword.toLowerCase()
  const occurrences = words.filter(word => word.includes(keywordLower)).length
  return (occurrences / words.length) * 100
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
