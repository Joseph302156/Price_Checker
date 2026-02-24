interface PinpointJob {
  id: string
  title: string
  description: string | null
  key_responsibilities: string | null
  key_responsibilities_header: string | null
  benefits: string | null
  benefits_header: string | null
  compensation: string | null
  employment_type_text: string | null
  workplace_type_text: string | null
  url: string
  location: {
    name: string
  } | null
  job: {
    department: {
      name: string
    } | null
  } | null
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

function buildFullDescription(job: PinpointJob): string {
  const parts: string[] = []
  
  // Main description
  if (job.description) {
    parts.push(job.description)
  }
  
  // Key responsibilities / What to expect
  if (job.key_responsibilities) {
    const header = job.key_responsibilities_header || 'What to Expect'
    parts.push(`<h2>${header}</h2>${job.key_responsibilities}`)
  }
  
  // Benefits
  if (job.benefits) {
    const header = job.benefits_header || 'Benefits'
    parts.push(`<h2>${header}</h2>${job.benefits}`)
  }
  
  // Compensation
  if (job.compensation) {
    parts.push(`<p><strong>Compensation:</strong> ${job.compensation}</p>`)
  }
  
  // Work type
  if (job.workplace_type_text) {
    parts.push(`<p><strong>Workplace:</strong> ${job.workplace_type_text}</p>`)
  }
  
  return parts.join('\n\n')
}

export async function scrapePinpoint(boardToken: string): Promise<NormalizedJob[]> {
  const url = `https://${boardToken}.pinpointhq.com/postings.json`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Pinpoint API error: ${response.status}`)
  }

  const data = await response.json() as { data: PinpointJob[] }

  return data.data.map((job) => ({
    external_id: job.id,
    title: job.title.trim(),
    location: job.location?.name || null,
    description: buildFullDescription(job),
    url: job.url,
    department: job.job?.department?.name || null,
    employment_type: job.employment_type_text || null,
    published_at: null, // Pinpoint doesn't expose published_at
  }))
}

// Pinpoint doesn't expose company description in their API
export async function getPinpointCompanyDescription(): Promise<string | null> {
  return null
}
