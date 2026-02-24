interface LeverList {
  text: string
  content: string
}

interface LeverPosting {
  id: string
  text: string
  categories: {
    commitment?: string
    department?: string
    location?: string
    team?: string
  }
  description?: string
  lists?: LeverList[]
  additional?: string
  salaryRange?: {
    min: number
    max: number
    currency: string
    interval: string
  }
  salaryDescription?: string
  createdAt: number
  hostedUrl: string
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

function buildFullDescription(job: LeverPosting): string {
  const parts: string[] = []

  if (job.description) {
    parts.push(job.description)
  }

  if (job.lists && job.lists.length > 0) {
    for (const list of job.lists) {
      parts.push(`<h3>${list.text}</h3>`)
      parts.push(list.content)
    }
  }

  if (job.additional) {
    parts.push(`<h3>Additional Information</h3>`)
    parts.push(job.additional)
  }

  if (job.salaryRange) {
    const { min, max, currency, interval } = job.salaryRange
    parts.push(`<h3>Compensation</h3>`)
    parts.push(`<p>${currency} ${min.toLocaleString()} - ${max.toLocaleString()} per ${interval}</p>`)
  }

  return parts.join('\n')
}

export async function scrapeLever(companyId: string): Promise<NormalizedJob[]> {
  const url = `https://api.lever.co/v0/postings/${companyId}?mode=json`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Lever API error: ${response.status}`)
  }

  const data = await response.json() as LeverPosting[]

  return data.map((job) => ({
    external_id: job.id,
    title: job.text,
    location: job.categories?.location || null,
    description: buildFullDescription(job),
    url: job.hostedUrl,
    department: job.categories?.department || job.categories?.team || null,
    employment_type: job.categories?.commitment || null,
    published_at: job.createdAt ? new Date(job.createdAt).toISOString() : null,
  }))
}
