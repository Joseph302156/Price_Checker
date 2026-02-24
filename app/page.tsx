'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToBuilding = () => {
    document.getElementById('building')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-ink text-cream">
      {/* Hero Section */}
      <main className="min-h-screen w-screen flex flex-col justify-center p-8 md:p-12 lg:p-16 relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ember/5 via-transparent to-transparent pointer-events-none" />

        {/* Main content */}
        <div className="flex flex-col justify-center relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8">
              Education is{' '}
              <span className="italic text-ember">broken</span>.
              <br />
              We're finding who's{' '}
              <span className="italic">fixing it</span>.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-body text-lg md:text-xl text-cream/60 max-w-xl mb-6"
          >
            A curated community for those building the future of learning. 
            Builders, operators, and dreamers reshaping education.
          </motion.p>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display italic text-sm opacity-50 mb-10"
          >
            Jobs · Community · Landscape
          </motion.div>

          {/* Email signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-transparent border-b border-cream/30 py-3 font-body text-cream placeholder:text-cream/30 focus:border-ember transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="font-body text-sm tracking-wide bg-cream text-ink px-6 py-3 hover:bg-ember hover:text-ink transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Get early access'}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-body text-ember"
              >
                You're in. We'll be in touch.
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Centered scroll button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
        >
          <button 
            onClick={scrollToAbout}
            className="font-display italic text-base px-6 py-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/20 text-cream/90 hover:bg-white/10 hover:text-cream hover:border-white/30 transition-all flex items-center gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_24px_rgba(0,0,0,0.3)]"
          >
            Our story
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              ↓
            </motion.span>
          </button>
        </motion.div>
      </main>

      {/* About Section */}
      <section id="about" className="min-h-screen w-screen relative flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-ember/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-24 md:py-32">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16 md:mb-24"
          >
            <span className="font-body text-sm tracking-wide text-ember mb-4 block">
              The Story
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-tight">
              We built the largest<br />
              <span className="italic">EdTech job board</span>.
            </h2>
          </motion.div>

          {/* Content grid */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-24">
            {/* Left column - The past */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="font-display text-2xl md:text-3xl italic mb-6 text-cream/80">
                Where we've been
              </h3>
              <div className="space-y-4 font-body text-cream/60 leading-relaxed">
                <p>
                  Three years ago, we built something that grew beyond what we imagined. 
                  Thousands of people every month, finding thousands of jobs in education. 
                  Curriculum companies, assessment platforms, the large players doing 
                  important work.
                </p>
                <p>
                  We were in those same jobs ourselves. We know the work is valuable. 
                  We know these organizations help millions of students.
                </p>
                <p className="text-cream/40">
                  But we also know the system they serve is broken.
                </p>
              </div>
            </motion.div>

            {/* Right column - The future */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="font-display text-2xl md:text-3xl italic mb-6 text-cream/80">
                Where we're going
              </h3>
              <div className="space-y-4 font-body text-cream/60 leading-relaxed">
                <p>
                  We don't want to just "keep the lights on" in a broken system. 
                  We want to <span className="text-ember">transform</span> education.
                </p>
                <p>
                  We'll still post jobs. You'll still find opportunities here. 
                  But now we're something more—a community, a lens into the landscape 
                  of innovation, a compass pointing toward the founders, investors, 
                  and builders who are reimagining what learning can be.
                </p>
                <p>
                  Some call this EdTech. We call it the future of education.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Scroll to vision button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mt-20 md:mt-24"
          >
            <button 
              onClick={scrollToBuilding}
              className="font-display italic text-base px-6 py-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/20 text-cream/90 hover:bg-white/10 hover:text-cream hover:border-white/30 transition-all flex items-center gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_24px_rgba(0,0,0,0.3)]"
            >
              Our vision
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                ↓
              </motion.span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Vision/Building Section */}
      <section id="building" className="min-h-screen w-screen relative">
        <div className="absolute inset-0 bg-gradient-to-b from-ember/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-24 md:py-32">
          {/* Bottom section - What's coming */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-display text-2xl md:text-3xl italic mb-10 text-cream/80">
              What we're building
            </h3>
            <div className="grid sm:grid-cols-3 gap-8 md:gap-12">
              <div>
                <div className="font-display text-5xl md:text-6xl text-ember mb-4">01</div>
                <h4 className="font-body text-sm tracking-wide uppercase mb-2">Curated Jobs</h4>
                <p className="font-body text-cream/50 text-sm leading-relaxed">
                  Not everything in education. The innovators, the disruptors, 
                  the ones building what's next.
                </p>
              </div>
              <div>
                <div className="font-display text-5xl md:text-6xl text-ember mb-4">02</div>
                <h4 className="font-body text-sm tracking-wide uppercase mb-2">Community</h4>
                <p className="font-body text-cream/50 text-sm leading-relaxed">
                  A place for those who believe education can be different. 
                  Founders, operators, dreamers.
                </p>
              </div>
              <div>
                <div className="font-display text-5xl md:text-6xl text-ember mb-4">03</div>
                <h4 className="font-body text-sm tracking-wide uppercase mb-2">Landscape</h4>
                <p className="font-body text-cream/50 text-sm leading-relaxed">
                  VCs, unicorns, Series A rockets, seed-stage bets. 
                  The full map of EdTech innovation.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-24 md:mt-32 text-center"
          >
            <p className="font-display text-3xl md:text-4xl italic mb-8">
              Ready to be part of it?
            </p>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-transparent border-b border-cream/30 py-3 font-body text-cream placeholder:text-cream/30 focus:border-ember transition-colors text-center sm:text-left"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="font-body text-sm tracking-wide bg-cream text-ink px-6 py-3 hover:bg-ember hover:text-ink transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join the waitlist'}
                </button>
              </form>
            ) : (
              <div className="font-body text-ember">
                You're in. We'll be in touch.
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <footer className="mt-24 md:mt-32 pt-8 border-t border-cream/10 flex justify-between items-center">
            <div className="font-body text-xs tracking-wide opacity-40">
              Work in EdTech © 2026
            </div>
            <div className="font-body text-xs tracking-wide opacity-40">
              Rebuilding
            </div>
          </footer>
        </div>
      </section>
    </div>
  )
}
