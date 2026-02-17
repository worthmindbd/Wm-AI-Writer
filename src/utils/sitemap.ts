// Sitemap fetcher and parser
// Handles regular sitemaps, sitemap indexes, and XML namespaces
// Multiple CORS proxy fallbacks for cross-origin requests

const CORS_PROXIES = [
    (url: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

async function fetchXML(url: string): Promise<string> {
    // Try direct fetch first (works if same-origin or server sends CORS headers)
    try {
        const resp = await fetch(url, { mode: 'cors' })
        if (resp.ok) {
            const text = await resp.text()
            if (text.includes('<urlset') || text.includes('<sitemapindex')) return text
        }
    } catch { /* CORS blocked — expected, try proxies */ }

    // Try each CORS proxy
    for (const makeProxyUrl of CORS_PROXIES) {
        try {
            const proxyUrl = makeProxyUrl(url)
            const resp = await fetch(proxyUrl)
            if (resp.ok) {
                const text = await resp.text()
                if (text.includes('<urlset') || text.includes('<sitemapindex')) return text
            }
        } catch { /* this proxy failed, try next */ }
    }

    throw new Error('Could not fetch sitemap. All proxy methods failed. Check the URL and try again.')
}

function extractLocs(xml: string, parentTag: 'url' | 'sitemap'): string[] {
    // Use regex-based extraction to avoid XML namespace issues with DOMParser
    const results: string[] = []
    const tagRegex = parentTag === 'url'
        ? /<url[\s>][\s\S]*?<\/url>/gi
        : /<sitemap[\s>][\s\S]*?<\/sitemap>/gi

    const matches = xml.match(tagRegex) || []
    for (const block of matches) {
        const locMatch = block.match(/<loc[^>]*>\s*(.*?)\s*<\/loc>/i)
        if (locMatch && locMatch[1]) {
            const cleanUrl = locMatch[1].replace(/&amp;/g, '&').trim()
            if (cleanUrl.startsWith('http')) results.push(cleanUrl)
        }
    }
    return results
}

function isSitemapIndex(xml: string): boolean {
    return xml.includes('<sitemapindex')
}

export async function fetchSitemapLinks(sitemapUrl: string): Promise<string[]> {
    const xml = await fetchXML(sitemapUrl)

    // Regular sitemap with <url><loc>...</loc></url>
    if (!isSitemapIndex(xml)) {
        const urls = extractLocs(xml, 'url')
        if (urls.length === 0) throw new Error('No URLs found in sitemap. Check the URL format.')
        return urls.slice(0, 150)
    }

    // Sitemap index — extract sub-sitemap URLs and crawl them
    const subSitemaps = extractLocs(xml, 'sitemap')
    if (subSitemaps.length === 0) throw new Error('Sitemap index found but no sub-sitemaps listed.')

    const allUrls: string[] = []
    // Fetch up to 5 sub-sitemaps (post sitemaps are usually first)
    for (const sub of subSitemaps.slice(0, 5)) {
        try {
            const subXml = await fetchXML(sub)
            const subUrls = extractLocs(subXml, 'url')
            allUrls.push(...subUrls)
            if (allUrls.length >= 150) break
        } catch {
            // Skip failed sub-sitemaps silently
        }
    }

    if (allUrls.length === 0) throw new Error('Could not extract any URLs from sub-sitemaps.')
    return [...new Set(allUrls)].slice(0, 150)
}
