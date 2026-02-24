import { getActiveJobs } from '@/lib/db/queries'
import JobListings from './JobListings'
import Link from 'next/link'
import { Suspense } from 'react'

export const revalidate = 3600 // Revalidate every hour

export default async function JobsPage() {
  const jobs = await getActiveJobs()

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="border-b border-cream/10">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/" className="font-display text-xl">
            Work in EdTech
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/jobs" className="font-body text-sm text-ember">
              Jobs
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ember/20 via-ember/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-ember/10 to-transparent pointer-events-none blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-tight mb-6">
            Find your place in the{' '}
            <span className="italic text-ember">future</span>{' '}
            of learning.
          </h1>
          <p className="font-body text-lg md:text-xl text-cream/60 max-w-2xl">
            Your chance to reshape how the world learns. 
            Curated roles at the companies actually transforming education.
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Stats header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16 mb-12 pb-8 border-b border-cream/10">
          <div>
            <div className="font-display text-6xl md:text-7xl italic text-ember leading-none">
              {jobs.length}
            </div>
            <div className="font-body text-sm text-cream/50 mt-2">
              open roles
            </div>
          </div>
          <div>
            <div className="font-display text-6xl md:text-7xl italic text-ember leading-none">
              {new Set(jobs.map(j => j.companies.id)).size}
            </div>
            <div className="font-body text-sm text-cream/50 mt-2">
              companies
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="text-cream/40">Loading...</div>}>
          <JobListings jobs={jobs} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-cream/10 mt-24">
        <div className="max-w-6xl mx-auto px-8 py-8 flex justify-between items-center">
          <div className="font-body text-xs text-cream/40">
            Work in EdTech © 2026
          </div>
          <div className="font-body text-xs text-cream/40">
            Updated daily
          </div>
        </div>
      </footer>
    </div>
  )
}
