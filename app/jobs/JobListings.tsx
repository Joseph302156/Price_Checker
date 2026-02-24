'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { JobWithCompany } from '@/lib/db/queries'
import type { CompanyStage } from '@/lib/db'

type ViewMode = 'company' | 'recent'

const STAGE_OPTIONS: { value: CompanyStage | 'all'; label: string }[] = [
  { value: 'all', label: 'All Stages' },
  { value: 'public', label: 'Public / IPO' },
  { value: 'unicorn', label: 'Unicorn' },
  { value: 'series-d+', label: 'Series D+' },
  { value: 'series-c', label: 'Series C' },
  { value: 'series-b', label: 'Series B' },
  { value: 'series-a', label: 'Series A' },
  { value: 'seed', label: 'Seed' },
  { value: 'pre-seed', label: 'Pre-Seed' },
]

const STAGE_BADGE_STYLES: Record<CompanyStage, string> = {
  'public': 'bg-purple-500/20 text-purple-400',
  'unicorn': 'bg-amber-500/20 text-amber-400',
  'series-d+': 'bg-blue-500/20 text-blue-400',
  'series-c': 'bg-blue-500/20 text-blue-400',
  'series-b': 'bg-sky-500/20 text-sky-400',
  'series-a': 'bg-teal-500/20 text-teal-400',
  'seed': 'bg-green-500/20 text-green-400',
  'pre-seed': 'bg-emerald-500/20 text-emerald-400',
}

const STAGE_LABELS: Record<CompanyStage, string> = {
  'public': 'Public',
  'unicorn': 'Unicorn',
  'series-d+': 'Series D+',
  'series-c': 'Series C',
  'series-b': 'Series B',
  'series-a': 'Series A',
  'seed': 'Seed',
  'pre-seed': 'Pre-Seed',
}

interface Props {
  jobs: JobWithCompany[]
}

export default function JobListings({ jobs }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const viewMode: ViewMode = (searchParams.get('view') as ViewMode) || 'company'
  const stageFilter = searchParams.get('stage') as CompanyStage | null

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === 'all' || (key === 'view' && value === 'company')) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(`/jobs${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  // Filter jobs by stage
  const filteredJobs = stageFilter 
    ? jobs.filter(job => job.companies.stage === stageFilter)
    : jobs

  // Group jobs by company (sorted alphabetically)
  const jobsByCompany = filteredJobs.reduce((acc, job) => {
    const companyName = job.companies.name
    if (!acc[companyName]) {
      acc[companyName] = {
        company: job.companies,
        jobs: []
      }
    }
    acc[companyName].jobs.push(job)
    return acc
  }, {} as Record<string, { company: typeof jobs[0]['companies'], jobs: typeof jobs }>)

  // Sort jobs within each company by most recent first
  Object.values(jobsByCompany).forEach(({ jobs: companyJobs }) => {
    companyJobs.sort((a, b) => {
      const dateA = a.published_at || a.first_seen_at
      const dateB = b.published_at || b.first_seen_at
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  })

  // Sort companies alphabetically
  const sortedCompanies = Object.entries(jobsByCompany).sort(([a], [b]) => 
    a.localeCompare(b)
  )

  // Jobs sorted by most recent (use published_at from ATS, fallback to first_seen_at)
  const recentJobs = [...filteredJobs].sort((a, b) => {
    const dateA = a.published_at || a.first_seen_at
    const dateB = b.published_at || b.first_seen_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return (
    <>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* View toggle */}
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-cream/40 mr-1">View:</span>
          <button
            onClick={() => updateParams('view', 'company')}
            className={`font-body text-sm px-3 py-1.5 rounded-full transition-all ${
              viewMode === 'company'
                ? 'bg-ember text-ink'
                : 'bg-cream/5 text-cream/60 hover:bg-cream/10'
            }`}
          >
            By Company
          </button>
          <button
            onClick={() => updateParams('view', 'recent')}
            className={`font-body text-sm px-3 py-1.5 rounded-full transition-all ${
              viewMode === 'recent'
                ? 'bg-ember text-ink'
                : 'bg-cream/5 text-cream/60 hover:bg-cream/10'
            }`}
          >
            Most Recent
          </button>
        </div>

        {/* Stage filter */}
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-cream/40 mr-1">Stage:</span>
          <select
            value={stageFilter || 'all'}
            onChange={(e) => updateParams('stage', e.target.value)}
            className="font-body text-sm px-3 py-1.5 rounded-full bg-cream/5 text-cream/80 border border-cream/10 hover:border-cream/20 focus:outline-none focus:border-ember transition-all cursor-pointer"
          >
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-ink text-cream">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <span className="font-body text-sm text-cream/40 ml-auto">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
          {stageFilter && ` at ${STAGE_LABELS[stageFilter]} companies`}
        </span>
      </div>

      {/* Company View */}
      {viewMode === 'company' && (
        <div>
          {sortedCompanies.map(([, { company, jobs: companyJobs }]) => (
            <div key={company.id} className="mb-12">
              {/* Company header */}
              <div className="flex items-center gap-4 mb-6">
                <CompanyLogo 
                  logoUrl={company.logo_url} 
                  name={company.name} 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl">{company.name}</h2>
                    {company.stage && (
                      <span className={`font-body text-xs px-2 py-0.5 rounded-full ${STAGE_BADGE_STYLES[company.stage]}`}>
                        {STAGE_LABELS[company.stage]}
                      </span>
                    )}
                  </div>
                  {company.description && (
                    <p className="font-body text-sm text-cream/50 mt-1 max-w-md">
                      {company.description}
                    </p>
                  )}
                </div>
                <div className="ml-auto font-body text-sm text-cream/40">
                  {companyJobs.length} {companyJobs.length === 1 ? 'role' : 'roles'}
                </div>
              </div>

              {/* Jobs list - show max 5 */}
              <div className="space-y-2">
                {companyJobs.slice(0, 5).map((job) => (
                  <JobCard key={job.id} job={job} showCompany={false} />
                ))}
              </div>

              {/* See more link if > 5 jobs */}
              {companyJobs.length > 5 && (
                <Link
                  href={`/companies/${company.slug}`}
                  className="inline-block mt-4 font-body text-sm text-ember hover:underline"
                >
                  See all {companyJobs.length} roles at {company.name} →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent View */}
      {viewMode === 'recent' && (
        <div className="space-y-2">
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} showCompany={true} />
          ))}
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-cream/40">
            No jobs yet. Check back soon—we update daily.
          </p>
        </div>
      )}
    </>
  )
}

function getTimeAgo(dateStr: string | null): { label: string; color: string } | null {
  if (!dateStr) return null
  
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) {
    return { label: 'Today', color: 'bg-green-500/20 text-green-400' }
  } else if (diffDays < 7) {
    return { label: `${diffDays}d ago`, color: 'bg-green-500/20 text-green-400' }
  } else if (diffDays < 21) {
    const weeks = Math.floor(diffDays / 7)
    return { label: `${weeks}w ago`, color: 'bg-amber-500/20 text-amber-400' }
  } else {
    return { label: '1mo+', color: 'bg-cream/10 text-cream/40' }
  }
}

function JobCard({ job, showCompany }: { job: JobWithCompany, showCompany: boolean }) {
  const timeAgo = getTimeAgo(job.published_at || job.first_seen_at)
  
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block group"
    >
      <div className="border border-cream/10 rounded-lg p-4 hover:border-cream/20 hover:bg-cream/[0.02] transition-all">
        <div className="flex items-start sm:items-center gap-3">
          {showCompany && (
            <div className="flex items-center gap-3 w-36 flex-shrink-0">
              <CompanyLogo 
                logoUrl={job.companies.logo_url} 
                name={job.companies.name}
                size="sm"
              />
              <span className="font-body text-sm text-cream/60 truncate">
                {job.companies.name}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-body text-base group-hover:text-ember transition-colors truncate sm:whitespace-normal">
              {job.title}
            </h3>
            {job.location && (
              <p className="font-body text-sm text-cream/40 truncate sm:hidden mt-1">
                {job.location}
              </p>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {job.location && (
              <span className="font-body text-sm text-cream/40 max-w-[200px] truncate">
                {job.location}
              </span>
            )}
            {job.department && (
              <span className="font-body text-xs text-cream/30 bg-cream/5 px-2 py-1 rounded whitespace-nowrap">
                {job.department}
              </span>
            )}
            {timeAgo && (
              <span className={`font-body text-xs px-2 py-1 rounded whitespace-nowrap ${timeAgo.color}`}>
                {timeAgo.label}
              </span>
            )}
          </div>
          {/* Mobile: just show time badge */}
          <div className="sm:hidden flex-shrink-0">
            {timeAgo && (
              <span className={`font-body text-xs px-2 py-1 rounded whitespace-nowrap ${timeAgo.color}`}>
                {timeAgo.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function CompanyLogo({ logoUrl, name, size = 'md' }: { logoUrl: string | null, name: string, size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  if (logoUrl) {
    return (
      <div className={`${sizeClasses} rounded-lg bg-cream/10 flex items-center justify-center overflow-hidden flex-shrink-0`}>
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={size === 'sm' ? 32 : 48}
          height={size === 'sm' ? 32 : 48}
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses} rounded-lg bg-ember/20 flex items-center justify-center flex-shrink-0`}>
      <span className={`font-display ${textSize} text-ember`}>{initials}</span>
    </div>
  )
}
