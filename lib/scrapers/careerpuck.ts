interface CareerPuckJob {
  permalink: string
  title: string
  content: string | null
  location: string | null
  publicUrl: string
  postedAt: string | null
  offices: Array<{ name: string }> | null
  departments: Array<{ name: string }> | null
  workType: string | null
}

interface CareerPuckResponse {
  jobs: CareerPuckJob[]
}

export interface NormalizedJob {
  external_id: string
  title: string
  location: string | null
  description: string | null
  url: string
  department: string | null
  employment_type: string | null
  published_at: string | null
}

// CareerPuck returns aggressively HTML-entity encoded content
// This decodes all named and numeric HTML entities
function decodeHtmlEntities(html: string): string {
  const entities: Record<string, string> = {
    '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&apos;': "'",
    '&sol;': '/', '&period;': '.', '&comma;': ',', '&colon;': ':',
    '&semi;': ';', '&equals;': '=', '&plus;': '+', '&minus;': '-',
    '&ast;': '*', '&percnt;': '%', '&num;': '#', '&dollar;': '$',
    '&excl;': '!', '&quest;': '?', '&lpar;': '(', '&rpar;': ')',
    '&lsqb;': '[', '&rsqb;': ']', '&lcub;': '{', '&rcub;': '}',
    '&lowbar;': '_', '&hyphen;': '-', '&ndash;': '\u2013', '&mdash;': '\u2014',
    '&nbsp;': ' ', '&NewLine;': '\n', '&Tab;': '\t',
    '&lsquo;': '\u2018', '&rsquo;': '\u2019', '&ldquo;': '\u201C', '&rdquo;': '\u201D',
    '&CloseCurlyQuote;': '\u2019', '&OpenCurlyQuote;': '\u2018',
    '&CloseCurlyDoubleQuote;': '\u201D', '&OpenCurlyDoubleQuote;': '\u201C',
    '&copy;': '\u00A9', '&reg;': '\u00AE', '&trade;': '\u2122',
    '&hellip;': '\u2026', '&bull;': '\u2022', '&middot;': '\u00B7',
    '&uuml;': '\u00FC', '&ouml;': '\u00F6', '&auml;': '\u00E4',
    '&Uuml;': '\u00DC', '&Ouml;': '\u00D6', '&Auml;': '\u00C4',
    '&ntilde;': '\u00F1', '&Ntilde;': '\u00D1', '&eacute;': '\u00E9', '&Eacute;': '\u00C9',
  }
  
  let decoded = html
  
  // Decode named entities
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.split(entity).join(char)
  }
  
  // Decode numeric entities (&#60; &#x3C; etc)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  return decoded
}

export async function scrapeCareerPuck(boardSlug: string): Promise<NormalizedJob[]> {
  const url = `https://api.careerpuck.com/v1/public/job-boards/${boardSlug}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`CareerPuck API error: ${response.status}`)
  }

  const data = await response.json() as CareerPuckResponse

  return data.jobs.map((job) => ({
    external_id: job.permalink,
    title: job.title.trim(),
    location: job.offices?.[0]?.name || job.location || null,
    description: job.content ? decodeHtmlEntities(job.content) : null,
    url: job.publicUrl,
    department: job.departments?.[0]?.name || null,
    employment_type: job.workType || null,
    published_at: job.postedAt || null,
  }))
}

// CareerPuck doesn't expose company description in their public API
export async function getCareerPuckCompanyDescription(): Promise<string | null> {
  return null
}
