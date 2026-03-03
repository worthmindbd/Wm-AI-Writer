export interface ContentRequest {
  focusKeyword: string
  lsiKeywords: string[]
  targetAudience: string
  title: string
  wordCount: number
  tone: 'professional' | 'casual' | 'friendly' | 'witty' | 'inspirational' | 'bold' | 'empathetic' | 'storytelling'
  format: 'blog-post' | 'article' | 'product-description'
  language: string
}

export interface RewriteRequest {
  postUrl: string
  focusKeyword: string
  lsiKeywords: string[]
  sitemapLinks?: string[]
  tone: 'professional' | 'casual' | 'friendly' | 'witty' | 'inspirational' | 'bold' | 'empathetic' | 'storytelling'
  language: string
  targetAudience?: string
  lengthStrategy?: 'keep_same' | 'make_longer' | 'make_shorter'
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
  tone: 'professional' | 'casual' | 'friendly' | 'witty' | 'inspirational' | 'bold' | 'empathetic' | 'storytelling'
  format: 'blog-post' | 'article' | 'product-description'
  language: string
  targetAudience: string
  targetWordCount: number
  internalLinks?: string[]
  imagePrompts?: ImagePrompt[]
  isRewrite?: boolean
  originalUrl?: string
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

