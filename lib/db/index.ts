import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}
if (!supabaseKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type CompanyStage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d+' | 'unicorn' | 'public'

export interface Company {
  id: string
  name: string
  slug: string
  ats_provider: 'greenhouse' | 'lever' | 'ashby' | 'pinpoint' | 'careerpuck' | 'workday'
  ats_id: string
  website: string | null
  logo_url: string | null
  description: string | null
  stage: CompanyStage | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string
  external_id: string
  title: string
  location: string | null
  description: string | null
  url: string
  department: string | null
  employment_type: string | null
  published_at: string | null
  is_active: boolean
  first_seen_at: string
  last_seen_at: string
  created_at: string
  updated_at: string
}

// Get all active companies
export async function getActiveCompanies(): Promise<Company[]> {
  console.log('[db] Connecting to:', supabaseUrl?.slice(0, 40) + '...')
  
  const { data, error, count } = await supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  console.log('[db] Query returned', data?.length, 'companies, count:', count)
  
  if (error) throw error
  return data || []
}

// Upsert jobs (insert new, update existing)
export async function upsertJobs(
  companyId: string,
  jobs: Omit<Job, 'id' | 'company_id' | 'is_active' | 'first_seen_at' | 'last_seen_at' | 'created_at' | 'updated_at'>[]
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0
  let updated = 0

  for (const job of jobs) {
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('company_id', companyId)
      .eq('external_id', job.external_id)
      .single()

    if (existing) {
      // Update last_seen_at and ensure it's active
      await supabase
        .from('jobs')
        .update({
          last_seen_at: new Date().toISOString(),
          is_active: true,
          title: job.title,
          location: job.location,
          description: job.description,
          url: job.url,
          department: job.department,
          employment_type: job.employment_type,
          published_at: job.published_at,
        })
        .eq('id', existing.id)
      updated++
    } else {
      // Insert new job
      await supabase.from('jobs').insert({
        company_id: companyId,
        ...job,
      })
      inserted++
    }
  }

  return { inserted, updated }
}

// Mark jobs as inactive if they weren't seen in this sync
// This handles jobs that have been removed from the ATS (filled, closed, etc.)
export async function markStaleJobsInactive(
  companyId: string,
  activeExternalIds: string[]
): Promise<number> {
  // Get all currently active jobs for this company
  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('id, external_id')
    .eq('company_id', companyId)
    .eq('is_active', true)

  if (!activeJobs || activeJobs.length === 0) return 0

  // Find jobs that are in our DB but not in the current ATS feed
  const staleJobs = activeJobs.filter(
    (job) => !activeExternalIds.includes(job.external_id)
  )

  if (staleJobs.length === 0) return 0

  // Mark them as inactive
  const staleIds = staleJobs.map((j) => j.id)
  await supabase
    .from('jobs')
    .update({ is_active: false })
    .in('id', staleIds)

  return staleJobs.length
}

// Update company logo URL
export async function updateCompanyLogo(companyId: string, logoUrl: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({ logo_url: logoUrl })
    .eq('id', companyId)
  if (error) throw error
}

// Update company description
export async function updateCompanyDescription(companyId: string, description: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({ description })
    .eq('id', companyId)
  if (error) throw error
}
