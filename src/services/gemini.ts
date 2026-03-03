import { buildAvoidancePrompt } from '../utils/ai-phrases'
import { buildGreetingPrompt, getToneDescription } from '../utils/greetings'
import type { ToneType } from '../utils/greetings'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export interface GeminiModel {
  id: string
  label: string
  tier: 'free' | 'paid'
  recommended?: boolean
}

export const GEMINI_MODELS: GeminiModel[] = [
  // — Gemini 3.1 —
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', tier: 'paid' },
  // — Gemini 3 —
  { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', tier: 'paid' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', tier: 'paid' },
  // — Gemini 2.5 —
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', tier: 'paid' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'free', recommended: true },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite', tier: 'free' },
]

export const DEFAULT_MODEL = 'gemini-2.5-flash'

// CORS proxies for fetching post content
const CORS_PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

function getModelUrl(model: string): string {
  return `${GEMINI_API_BASE}/${model}:generateContent`
}

interface GeminiRequest {
  contents: Array<{ parts: Array<{ text: string }> }>
  generationConfig?: { temperature?: number; topK?: number; topP?: number; maxOutputTokens?: number }
  tools?: Array<Record<string, unknown>>
}

interface GeminiResponse {
  candidates: Array<{ content: { parts: Array<{ text: string }> }; finishReason: string }>
}

export async function callGeminiAPI(apiKey: string, prompt: string, options?: { tools?: Array<Record<string, unknown>>; model?: string }): Promise<string> {
  const model = options?.model || DEFAULT_MODEL
  const requestBody: GeminiRequest = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 8192 },
  }
  if (options?.tools) requestBody.tools = options.tools

  const response = await fetch(`${getModelUrl(model)}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    const msg = errData?.error?.message || `${response.status} ${response.statusText}`
    if (response.status === 429) throw new Error('Rate limited — please wait a moment and try again.')
    if (response.status === 400) throw new Error('Invalid API key. Please check your key and try again.')
    if (response.status === 403) throw new Error('API key does not have permission. Check your API key settings.')
    throw new Error(`Gemini API error: ${msg}`)
  }

  const data: GeminiResponse = await response.json()
  if (!data.candidates?.length) throw new Error('No response from Gemini API')
  return data.candidates[0].content.parts[0].text
}

export async function generateLSIKeywords(apiKey: string, focusKeyword: string, model?: string): Promise<string> {
  const prompt = `For the focus keyword "${focusKeyword}", generate 8-10 LSI (Latent Semantic Indexing) keywords.
These should be semantically related terms that search engines associate with the topic.
Return ONLY the keywords separated by commas, nothing else. No numbering, no explanations.`
  const response = await callGeminiAPI(apiKey, prompt, { model })
  return response.trim().replace(/\n/g, ', ')
}

export async function generateTitles(apiKey: string, focusKeyword: string, lsiKeywords: string[], model?: string): Promise<string[]> {
  const lsiPart = lsiKeywords.length > 0 ? `\nRelated keywords to weave in naturally: ${lsiKeywords.join(', ')}.` : ''
  const prompt = `You are an SEO expert and professional blog title writer.

First, search Google for the keyword "${focusKeyword}" and study what titles top-ranking blog posts are using. Analyze the patterns — what makes them click-worthy and rank well.${lsiPart}

Now generate 5 blog post titles that could OUTPERFORM those existing titles. 

Title rules:
- Keep each title SHORT (6-10 words max)
- NEVER use colons (:) or semicolons (;)
- Don't use formats like "Keyword: Something" — that's generic and spammy
- Make them feel human, catchy, and click-worthy
- Include the focus keyword "${focusKeyword}" naturally
- Each title should take a different angle or approach
- Think like a professional blogger who wants maximum clicks AND rankings

Return ONLY the 5 titles, one per line, numbered 1-5. No explanations.`

  const response = await callGeminiAPI(apiKey, prompt, { tools: [{ google_search: {} }], model })
  return response.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, '').replace(/^\*\*|\*\*$/g, '').trim()).filter(l => l.length > 5).slice(0, 5)
}

export async function generateContent(apiKey: string, params: {
  title: string; focusKeyword: string; lsiKeywords: string[]
  wordCount: number; tone: string; format: string; language: string; targetAudience?: string; internalLinks?: string[]; model?: string
}): Promise<string> {
  const { title, focusKeyword, lsiKeywords, wordCount, tone, format, language, targetAudience, internalLinks, model } = params
  const toneKey = tone as ToneType
  const toneDesc = getToneDescription(toneKey)
  const audienceLine = targetAudience ? `\nTarget Audience: ${targetAudience}` : ''
  const audienceReq = targetAudience ? `\n- Tailor the language, examples, and depth to suit the target audience` : ''

  let internalLinkSection = ''
  let internalLinkReq = ''
  if (internalLinks && internalLinks.length > 0) {
    const links = internalLinks.slice(0, 80).join('\n')
    internalLinkSection = `\n\nInternal Links Available (from the author's website):\n${links}`
    internalLinkReq = `\n- Naturally embed a MAXIMUM of 2 to 3 internal links from the list above as markdown hyperlinks [anchor text](url) where they are contextually relevant`
  }

  const prompt = `You are a top-tier content creator and SEO copywriter. Write a ${format} titled "${title}" in ${language}.

Focus Keyword: "${focusKeyword}"
Related Keywords: ${lsiKeywords.join(', ')}
Tone: ${toneDesc}
Target Word Count: ${wordCount}${audienceLine}${internalLinkSection}
${buildGreetingPrompt(toneKey)}

Content requirements:
- Start with a warm greeting that matches the tone, then flow into a short, engaging intro paragraph (2-3 sentences, no heading)
- The greeting + intro should hook the reader immediately — address their pain point, curiosity, or desire
- Do NOT use # (H1) anywhere; the post title is already an H1. Start with ## (H2) and go down to #### (H4) max.
- Use ## for main section headings — keep them SHORT (3-5 words, no colons)
- Use ### sparingly, only when a section truly needs sub-points
- Every section should deliver real value — no filler content or obvious statements
- Include actionable tips, real examples, or relatable scenarios where possible
- Write a brief conclusion with a clear call-to-action
- Naturally work in the focus keyword and related keywords
- Use markdown formatting${audienceReq}${internalLinkReq}

Tone & Voice rules:
- Maintain the ${tone} tone consistently throughout the entire article
- The greeting sets the emotional tone — carry that energy through every paragraph
- Use language and expressions that feel natural for this tone
- Match sentence structure to the tone (e.g., short punchy for bold, flowing for storytelling)

Formatting rules (VERY IMPORTANT):
- Keep paragraphs SHORT — 2-4 sentences max, then break
- Use **bold** VERY sparingly — at most 2-3 bolded phrases per entire article, only for truly key points
- Headings should be casual and short like "Why It Matters" not "Understanding Why This Topic Matters For Your Business"
- NEVER use colons (:) in headings
- Mix in bullet points or numbered lists to break up text
- Leave breathing room — don't wall-of-text the reader
- Write scannable content that's easy to skim
${buildAvoidancePrompt()}

Write the full article now:`
  return await callGeminiAPI(apiKey, prompt, { model })
}

export async function fetchPostContent(url: string): Promise<string> {
  let html = ''

  // Try proxies to bypass CORS
  for (const makeProxyUrl of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxyUrl(url)
      const resp = await fetch(proxyUrl)
      if (resp.ok) {
        html = await resp.text()
        break
      }
    } catch { /* this proxy failed, try next */ }
  }

  if (!html) {
    throw new Error('Could not fetch content from the provided URL. Ensure it is accessible.')
  }

  // Very basic HTML to text extraction (strip scripts, styles, tags)
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

export async function rewriteContent(apiKey: string, params: {
  originalContent: string; focusKeyword: string; lsiKeywords: string[]
  tone: string; language: string; internalLinks?: string[]; model?: string
  targetAudience?: string; lengthStrategy?: 'keep_same' | 'make_longer' | 'make_shorter'
}): Promise<string> {
  const { originalContent, focusKeyword, lsiKeywords, tone, language, internalLinks, model, targetAudience, lengthStrategy } = params
  const toneKey = tone as ToneType
  const toneDesc = getToneDescription(toneKey)

  const lsiReq = lsiKeywords.length > 0
    ? `\n- Naturally integrate these LSI keywords: ${lsiKeywords.join(', ')}`
    : ''

  const linksReq = internalLinks && internalLinks.length > 0
    ? `\n- Weave in a MAXIMUM of 2 to 3 of these internal links naturally with relevant anchor text:\n${internalLinks.join('\n')}`
    : ''

  const audReq = targetAudience && targetAudience.trim().length > 0
    ? `\n- Ensure the content is tailored for this target audience: ${targetAudience.trim()}`
    : ''

  let lengthReq = '- Maintain the original core message and facts, but improve the structure and flow.'
  if (lengthStrategy === 'make_longer') {
    lengthReq = '- Make the article significantly longer and more comprehensive than the original while maintaining the core message. Expand on concepts and add valuable depth. The final output MUST be exactly between 2,000 to 3,000 words long.'
  } else if (lengthStrategy === 'make_shorter') {
    lengthReq = '- Summarize and make the article more concise than the original while keeping the core message intact. Get straight to the point.'
  }

  const prompt = `You are a top-tier content creator, SEO strategist, and expert copywriter.
I have an existing piece of content. I want you to completely rewrite it to dramatically improve its SEO, readability, and engagement.

Goal: Rank highly for the focus keyword "${focusKeyword}".

Requirements:
- Language: ${language}
- Tone: ${toneDesc}${audReq}
${lengthReq}
${buildGreetingPrompt(toneKey)}

Structure & SEO:
- Start the rewritten article with a warm greeting that matches the ${tone} tone, then flow into an engaging intro
- Do NOT use # (H1) anywhere; the post title is already an H1.
- Add compelling Markdown headings starting from ## (H2), down to #### (H4) max.
- Strongly optimize for "${focusKeyword}" in at least one H2, the introduction, and naturally throughout the text.${lsiReq}${linksReq}
- Every section should deliver real value — no filler content
- Include actionable insights, examples, or relatable scenarios

Tone & Voice:
- Maintain the ${tone} tone consistently throughout the entire article
- The greeting sets the emotional tone — carry that energy through every paragraph
- Use language and expressions that feel natural for this tone

Formatting:
- Keep paragraphs SHORT — 2-4 sentences max, then break
- Use **bold** VERY sparingly — at most 2-3 bolded phrases per entire article, only for truly key points
- NEVER use colons (:) in headings
- Leave breathing room — don't wall-of-text the reader
- Write scannable content that's easy to skim
- Mix in bullet points or numbered lists to break up text
${buildAvoidancePrompt()}

- Do NOT output any conversational filler (like "Here is the rewritten article"). Output ONLY the markdown content.

Here is the original content to rewrite:

${originalContent.substring(0, 15000)} /* Truncate to avoid token limits if too large */

Please rewrite this content now:`

  return await callGeminiAPI(apiKey, prompt, { model })
}

export async function generateMetaDescription(apiKey: string, title: string, focusKeyword: string, model?: string): Promise<string> {
  const prompt = `Write a compelling SEO meta description (max 155 characters) for "${title}" with keyword "${focusKeyword}". Return ONLY the description.`
  return (await callGeminiAPI(apiKey, prompt, { model })).trim().substring(0, 155)
}

export async function generateImagePrompts(apiKey: string, title: string, content: string, sectionCount: number, model?: string): Promise<Array<{ prompt: string; section: string }>> {
  const numImages = Math.min(Math.max(3, Math.floor(content.split(/\s+/).length / 300)), sectionCount + 3)
  const prompt = `For an article titled "${title}", generate ${numImages} image prompts.
The first 3 should be thumbnail/hero image options.
The rest should match specific sections from the article.

Return each prompt as:
SECTION: [section name or "Thumbnail"]
PROMPT: [detailed, descriptive prompt for AI image generation]

Generate ${numImages} image prompts now:`

  const response = await callGeminiAPI(apiKey, prompt, { model })
  const results: Array<{ prompt: string; section: string }> = []
  const blocks = response.split(/\n(?=SECTION:)/i)
  for (const block of blocks) {
    const sectionMatch = block.match(/SECTION:\s*(.+)/i)
    const promptMatch = block.match(/PROMPT:\s*(.+)/is)
    if (sectionMatch && promptMatch) {
      results.push({ section: sectionMatch[1].trim(), prompt: promptMatch[1].trim() })
    }
  }
  if (results.length === 0) {
    const lines = response.split('\n').filter(l => l.trim().length > 10)
    lines.slice(0, numImages).forEach((line, i) => {
      results.push({ section: i < 3 ? 'Thumbnail' : `Section ${i - 2}`, prompt: line.replace(/^\d+\.\s*/, '').trim() })
    })
  }
  return results
}

export async function validateApiKey(apiKey: string, model?: string): Promise<boolean> {
  try {
    const r = await fetch(`${getModelUrl(model || DEFAULT_MODEL)}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] }),
    })
    // 200 = works, 429 = valid key but rate limited, both mean the key itself is valid
    if (r.ok || r.status === 429) return true
    // 400 = invalid key format, 403 = permission denied
    if (r.status === 400 || r.status === 403) {
      const errData = await r.json().catch(() => ({}))
      throw new Error(errData?.error?.message || 'Invalid API key')
    }
    return false
  } catch (err) {
    if (err instanceof Error && err.message !== 'Invalid API key') throw err
    return false
  }
}
