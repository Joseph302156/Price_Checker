import { getJobsByCompany } from '@/lib/db/queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ slug: string }>
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

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const jobs = await getJobsByCompany(slug)

  if (jobs.length === 0) {
    notFound()
  }

  const company = jobs[0].companies

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="border-b border-cream/10">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/" className="font-display text-xl">
            Work in EdTech
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/jobs" className="font-body text-sm text-cream/60 hover:text-cream">
              ← All Jobs
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Company header */}
        <div className="flex items-center gap-6 mb-12">
          {company.logo_url ? (
            <div className="w-20 h-20 rounded-lg bg-cream/10 flex items-center justify-center overflow-hidden">
              <Image
                src={company.logo_url}
                alt={`${company.name} logo`}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-ember/20 flex items-center justify-center">
              <span className="font-display text-2xl text-ember">
                {company.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">
              {company.name}
            </h1>
            {company.description && (
              <p className="font-body text-cream/60 max-w-xl">
                {company.description}
              </p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-ember hover:underline mt-2 inline-block"
              >
                {company.website.replace('https://', '').replace('www.', '')} →
              </a>
            )}
          </div>
        </div>

        {/* Jobs count */}
        <div className="mb-8">
          <h2 className="font-display text-xl">
            {jobs.length} Open {jobs.length === 1 ? 'Role' : 'Roles'}
          </h2>
        </div>

        {/* Jobs list */}
        <div className="space-y-2">
          {jobs.map((job) => {
            const timeAgo = getTimeAgo(job.published_at || job.first_seen_at)
            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block group"
              >
                <div className="border border-cream/10 rounded-lg p-4 hover:border-cream/20 hover:bg-cream/[0.02] transition-all">
                  <div className="flex items-center gap-4">
                    <h3 className="font-body text-base group-hover:text-ember transition-colors flex-1 min-w-0 truncate sm:whitespace-normal">
                      {job.title}
                    </h3>
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
                    {/* Mobile: just time badge */}
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
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cream/10 mt-24">
        <div className="max-w-6xl mx-auto px-8 py-8 flex justify-between items-center">
          <div className="font-body text-xs text-cream/40">
            Work in EdTech © 2026
          </div>
          <Link href="/jobs" className="font-body text-xs text-cream/40 hover:text-cream">
            Browse all jobs
          </Link>
        </div>
      </footer>
    </div>
  )
}
