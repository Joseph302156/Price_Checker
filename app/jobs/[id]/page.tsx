import { getJobById } from '@/lib/db/queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Decode HTML entities - handles double/triple encoding
function decodeHtmlEntities(html: string): string {
  // Keep decoding until no more entities are found
  let decoded = html
  let prev = ''
  
  while (decoded !== prev) {
    prev = decoded
    decoded = decoded
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#0*39;/gi, "'")
      .replace(/&#x0*27;/gi, "'")
      .replace(/&#0*47;/gi, '/')
      .replace(/&#x0*2[Ff];/gi, '/')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#0*60;/gi, '<')
      .replace(/&#0*62;/gi, '>')
      .replace(/&#x0*3[Cc];/gi, '<')
      .replace(/&#x0*3[Ee];/gi, '>')
  }
  
  return decoded
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function JobPage({ params }: Props) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    notFound()
  }

  const company = job.companies

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="border-b border-cream/10">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
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
      <main className="max-w-4xl mx-auto px-8 py-12">
        {/* Company info */}
        <div className="flex items-center gap-4 mb-8">
          {company.logo_url ? (
            <div className="w-16 h-16 rounded-lg bg-cream/10 flex items-center justify-center overflow-hidden">
              <Image
                src={company.logo_url}
                alt={`${company.name} logo`}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-ember/20 flex items-center justify-center">
              <span className="font-display text-lg text-ember">
                {company.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <Link 
              href={`/companies/${company.slug}`}
              className="font-body text-cream/60 hover:text-ember transition-colors"
            >
              {company.name}
            </Link>
            {company.description && (
              <p className="font-body text-sm text-cream/40 mt-1">
                {company.description}
              </p>
            )}
          </div>
        </div>

        {/* Job title */}
        <h1 className="font-display text-3xl md:text-4xl mb-6">
          {job.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mb-8">
          {job.location && (
            <div className="font-body text-sm text-cream/60">
              📍 {job.location}
            </div>
          )}
          {job.department && (
            <div className="font-body text-sm text-cream/60">
              🏢 {job.department}
            </div>
          )}
          {job.employment_type && (
            <div className="font-body text-sm text-cream/60">
              ⏱️ {job.employment_type}
            </div>
          )}
        </div>

        {/* Apply button */}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-body text-sm bg-ember text-ink px-6 py-3 rounded hover:bg-ember/90 transition-colors mb-12"
        >
          Apply on {company.name}'s site →
        </a>

        {/* Job description */}
        {job.description && (
          <div 
            className="prose prose-invert prose-cream max-w-none font-body
              prose-headings:font-display prose-headings:text-cream
              prose-p:text-cream/70 prose-li:text-cream/70
              prose-a:text-ember prose-a:no-underline hover:prose-a:underline
              prose-strong:text-cream"
            dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(job.description) }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cream/10 mt-24">
        <div className="max-w-4xl mx-auto px-8 py-8 flex justify-between items-center">
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
