import { scrapeGreenhouse, getGreenhouseCompanyDescription } from './greenhouse'
import { scrapeLever } from './lever'
import { scrapeAshby, getAshbyCompanyDescription } from './ashby'
import { scrapePinpoint } from './pinpoint'
import { scrapeWorkday } from './workday'
import { scrapeCareerPuck } from './careerpuck'

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

export async function scrapeJobs(
  atsProvider: 'greenhouse' | 'lever' | 'ashby' | 'pinpoint' | 'careerpuck' | 'workday',
  atsId: string
): Promise<NormalizedJob[]> {
  switch (atsProvider) {
    case 'greenhouse':
      return scrapeGreenhouse(atsId)
    case 'lever':
      return scrapeLever(atsId)
    case 'ashby':
      return scrapeAshby(atsId)
    case 'pinpoint':
      return scrapePinpoint(atsId)
    case 'careerpuck':
      return scrapeCareerPuck(atsId)
    case 'workday':
      return scrapeWorkday(atsId)
    default:
      throw new Error(`Unknown ATS provider: ${atsProvider}`)
  }
}

export async function getCompanyDescription(
  atsProvider: 'greenhouse' | 'lever' | 'ashby' | 'pinpoint' | 'careerpuck' | 'workday',
  atsId: string
): Promise<string | null> {
  switch (atsProvider) {
    case 'greenhouse':
      return getGreenhouseCompanyDescription(atsId)
    case 'ashby':
      return getAshbyCompanyDescription(atsId)
    case 'lever':
    case 'pinpoint':
    case 'careerpuck':
    case 'workday':
      // These don't expose company description in their API
      return null
    default:
      return null
  }
}
