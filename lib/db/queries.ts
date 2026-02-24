import { supabase } from './index'
import type { Company, Job } from './index'

export interface JobWithCompany extends Job {
  companies: Company
}

// Get all active jobs with company info
export async function getActiveJobs(): Promise<JobWithCompany[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (*)
    `)
    .eq('is_active', true)
    .eq('companies.is_active', true)
    .order('last_seen_at', { ascending: false })

  if (error) throw error
  return (data || []) as JobWithCompany[]
}

// Get a single job by ID with company info
export async function getJobById(id: string): Promise<JobWithCompany | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as JobWithCompany
}

// Get jobs by company slug (sorted by most recent first)
export async function getJobsByCompany(slug: string): Promise<JobWithCompany[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies!inner (*)
    `)
    .eq('is_active', true)
    .eq('companies.slug', slug)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('first_seen_at', { ascending: false })

  if (error) throw error
  return (data || []) as JobWithCompany[]
}
