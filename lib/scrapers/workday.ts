import he from 'he'

interface WorkdayJobPosting {
  title: string
  externalPath: string
  timeType?: string
  locationsText?: string
  postedOn?: string
  bulletFields?: string[]
}

interface WorkdayJobsResponse {
  total: number
  jobPostings: WorkdayJobPosting[]
}

interface WorkdayJobDetail {
  jobPostingInfo: {
    id: string
    title: string
    jobDescription?: string
    startDate?: string
    postedDate?: string
    timeType?: string
    jobFamily?: { descriptor: string }[]
  }
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

function parseAtsId(atsId: string): { tenant: string; wdInstance: string; site: string } {
  const parts = atsId.split('/')
  if (parts.length !== 3) {
    throw new Error(`Invalid Workday ats_id format: ${atsId}. Expected: tenant/wdInstance/site`)
  }
  return { tenant: parts[0], wdInstance: parts[1], site: parts[2] }
}

function getBaseUrl(tenant: string, wdInstance: string): string {
  return `https://${tenant}.${wdInstance}.myworkdayjobs.com`
}

function getApiUrl(tenant: string, wdInstance: string, site: string): string {
  return `${getBaseUrl(tenant, wdInstance)}/wday/cxs/${tenant}/${site}`
}

async function fetchJobDetail(
  tenant: string,
  wdInstance: string,
  site: string,
  externalPath: string
): Promise<WorkdayJobDetail | null> {
  const url = `${getApiUrl(tenant, wdInstance, site)}${externalPath}`

  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.json() as WorkdayJobDetail
  } catch {
    return null
  }
}

export async function scrapeWorkday(atsId: string): Promise<NormalizedJob[]> {
  const { tenant, wdInstance, site } = parseAtsId(atsId)
  const baseUrl = getBaseUrl(tenant, wdInstance)
  const apiUrl = getApiUrl(tenant, wdInstance, site)

  const jobs: NormalizedJob[] = []
  let offset = 0
  const limit = 20

  while (true) {
    const response = await fetch(`${apiUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit, offset }),
    })

    if (!response.ok) {
      throw new Error(`Workday API error: ${response.status}`)
    }

    const data = await response.json() as WorkdayJobsResponse

    for (const posting of data.jobPostings) {
      // Extract job ID from externalPath (e.g., "/job/Remote/Title_R-123" -> "R-123" or use bulletFields)
      const externalId = posting.bulletFields?.[0] || posting.externalPath.split('_').pop() || posting.externalPath

      // Fetch full job details for description
      const detail = await fetchJobDetail(tenant, wdInstance, site, posting.externalPath)

      jobs.push({
        external_id: externalId,
        title: posting.title,
        location: posting.locationsText || null,
        description: detail?.jobPostingInfo?.jobDescription
          ? decodeHtmlEntities(detail.jobPostingInfo.jobDescription)
          : null,
        url: `${baseUrl}${posting.externalPath}`,
        department: detail?.jobPostingInfo?.jobFamily?.[0]?.descriptor || null,
        employment_type: posting.timeType || detail?.jobPostingInfo?.timeType || null,
        published_at: detail?.jobPostingInfo?.postedDate || null,
      })
    }

    offset += limit
    if (offset >= data.total) break
  }

  return jobs
}
