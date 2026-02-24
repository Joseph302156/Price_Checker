import { NextResponse } from 'next/server'
import { getActiveCompanies, upsertJobs, markStaleJobsInactive, updateCompanyLogo, updateCompanyDescription } from '@/lib/db'
import { scrapeJobs, getCompanyDescription } from '@/lib/scrapers'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  // Security check in production
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const results: {
    company: string
    inserted: number
    updated: number
    markedInactive: number
    error?: string
  }[] = []

  try {
    const companies = await getActiveCompanies()
    console.log(`[sync-jobs] Found ${companies.length} active companies`)

    // Process all companies in parallel
    const settledResults = await Promise.allSettled(
      companies.map(async (company) => {
        console.log(`[sync-jobs] Processing ${company.name} (${company.ats_provider})...`)

        // Auto-populate logo if missing
        if (!company.logo_url && company.website) {
          const hostname = new URL(company.website).hostname
          const token = process.env.LOGO_DEV_TOKEN
          if (token) {
            const generatedLogoUrl = `https://img.logo.dev/${hostname}?token=${token}`
            await updateCompanyLogo(company.id, generatedLogoUrl)
            console.log(`[sync-jobs] Updated logo for ${company.name}`)
          }
        }

        // Auto-populate description if missing
        if (!company.description) {
          const description = await getCompanyDescription(company.ats_provider, company.ats_id)
          if (description) {
            await updateCompanyDescription(company.id, description)
            console.log(`[sync-jobs] Updated description for ${company.name}`)
          }
        }

        // Scrape jobs from ATS
        const jobs = await scrapeJobs(company.ats_provider, company.ats_id)
        console.log(`[sync-jobs] Found ${jobs.length} jobs for ${company.name}`)

        // Upsert jobs (insert new, update existing)
        const { inserted, updated } = await upsertJobs(company.id, jobs)

        // Mark stale jobs as inactive
        const activeExternalIds = jobs.map((j) => j.external_id)
        const markedInactive = await markStaleJobsInactive(company.id, activeExternalIds)

        if (markedInactive > 0) {
          console.log(`[sync-jobs] Marked ${markedInactive} stale jobs as inactive for ${company.name}`)
        }

        return {
          company: company.name,
          inserted,
          updated,
          markedInactive,
        }
      })
    )

    // Convert settled results to results array
    for (let i = 0; i < settledResults.length; i++) {
      const result = settledResults[i]
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        console.error(`[sync-jobs] Error processing ${companies[i].name}:`, result.reason)
        results.push({
          company: companies[i].name,
          inserted: 0,
          updated: 0,
          markedInactive: 0,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('[sync-jobs] Fatal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
