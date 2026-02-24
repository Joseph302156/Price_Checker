import he from 'he'

interface GreenhouseJob {
  id: number
  title: string
  location: {
    name: string
  }
  content: string
  absolute_url: string
  departments: { name: string }[]
  metadata: { name: string; value: string }[] | null
  first_published: string
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

function decodeHtmlEntities(html: string): string {
  return he.decode(html)
}

export async function scrapeGreenhouse(boardToken: string): Promise<NormalizedJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Greenhouse API error: ${response.status}`)
  }

  const data = await response.json() as { jobs: GreenhouseJob[] }

  return data.jobs.map((job) => ({
    external_id: job.id.toString(),
    title: job.title,
    location: job.location?.name || null,
    description: job.content ? decodeHtmlEntities(job.content) : null,
    url: job.absolute_url,
    department: job.departments?.[0]?.name || null,
    employment_type: job.metadata?.find(m => m.name === 'Employment Type')?.value || null,
    published_at: job.first_published || null,
  }))
}

// Fetch company description from Greenhouse board info
export async function getGreenhouseCompanyDescription(boardToken: string): Promise<string | null> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}`
  
  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json() as { content?: string }
  
  if (!data.content) return null
  
  // Strip HTML tags and decode entities, then truncate
  const plainText = decodeHtmlEntities(data.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
  return plainText.length > 500 ? plainText.slice(0, 497) + '...' : plainText
}
