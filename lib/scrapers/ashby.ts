interface AshbyJob {
  id: string
  title: string
  location: string
  department: string | null
  team: string | null
  employmentType: string | null
  descriptionHtml?: string | null
  descriptionPlain?: string | null
  publishedAt: string
  jobUrl: string
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

export async function scrapeAshby(boardToken: string): Promise<NormalizedJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${boardToken}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Ashby API error: ${response.status}`)
  }

  const data = await response.json() as { jobs: AshbyJob[] }

  return data.jobs.map((job) => ({
    external_id: job.id,
    title: job.title,
    location: job.location || null,
    description: job.descriptionHtml || job.descriptionPlain || null,
    url: job.jobUrl,
    department: job.department || job.team || null,
    employment_type: job.employmentType || null,
    published_at: job.publishedAt || null,
  }))
}

// Fetch company description from Ashby board info
export async function getAshbyCompanyDescription(boardToken: string): Promise<string | null> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${boardToken}`

  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json() as { 
    jobs: AshbyJob[]
    description?: string
    descriptionHtml?: string 
  }
  
  const description = data.description || data.descriptionHtml
  if (!description) return null
  
  // Strip HTML tags and truncate
  const plainText = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return plainText.length > 500 ? plainText.slice(0, 497) + '...' : plainText
}
