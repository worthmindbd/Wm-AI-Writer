export interface ContentRequest {
  focusKeyword: string
  lsiKeywords: string[]
  targetAudience: string
  title: string
  wordCount: number
  tone: 'professional' | 'casual' | 'friendly'
  format: 'blog-post' | 'article' | 'product-description'
  language: string
}

export interface GeneratedContent {
  title: string
  content: string
  metaDescription: string
  urlSlug: string
  wordCount: number
  readingTime: number
  focusKeyword: string
  lsiKeywords: string[]
  tone: 'professional' | 'casual' | 'friendly'
  format: 'blog-post' | 'article' | 'product-description'
  language: string
  targetAudience: string
  targetWordCount: number
  internalLinks?: string[]
  imagePrompts?: ImagePrompt[]
}

export interface ImagePrompt {
  prompt: string
  section: string
}

export interface SEOAnalysis {
  keywordDensity: number
  focusKeywordCount: number
  lsiKeywordUsage: Record<string, number>
  seoScore: number
  readabilityScore: number
  headingCount: { h1: number; h2: number; h3: number }
}
