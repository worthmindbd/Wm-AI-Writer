import { buildAvoidancePrompt } from '../utils/ai-phrases'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export interface GeminiModel {
  id: string
  label: string
  recommended?: boolean
}

export const GEMINI_MODELS: GeminiModel[] = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', recommended: true },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
  { id: 'gemini-3.0-flash-preview', label: 'Gemini 3 Flash Preview' },
  { id: 'gemini-3.0-pro-preview', label: 'Gemini 3 Pro Preview' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite' },
  { id: 'gemini-exp-1206', label: 'Gemini Experimental 1206' },
]

export const DEFAULT_MODEL = 'gemini-2.5-flash'

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
  const audienceLine = targetAudience ? `\nTarget Audience: ${targetAudience}` : ''
  const audienceReq = targetAudience ? `\n- Tailor the language, examples, and depth to suit the target audience` : ''

  let internalLinkSection = ''
  let internalLinkReq = ''
  if (internalLinks && internalLinks.length > 0) {
    const links = internalLinks.slice(0, 80).join('\n')
    internalLinkSection = `\n\nInternal Links Available (from the author's website):\n${links}`
    internalLinkReq = `\n- Naturally embed 3-5 internal links from the list above as markdown hyperlinks [anchor text](url) where they are contextually relevant`
  }

  const prompt = `Write a ${format} titled "${title}" in ${language}.

Focus Keyword: "${focusKeyword}"
Related Keywords: ${lsiKeywords.join(', ')}
Tone: ${tone}
Target Word Count: ${wordCount}${audienceLine}${internalLinkSection}

Content requirements:
- Start with a short, engaging intro paragraph (2-3 sentences, no heading)
- Use ## for section headings — keep them SHORT (3-5 words, no colons)
- Use ### sparingly, only when a section truly needs sub-points
- Write a brief conclusion with a call-to-action
- Naturally work in the focus keyword and related keywords
- Use markdown formatting${audienceReq}${internalLinkReq}

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
