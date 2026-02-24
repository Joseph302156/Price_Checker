-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ats_provider TEXT NOT NULL,           -- 'greenhouse', 'lever', 'ashby', 'pinpoint', 'careerpuck', 'workday'
  ats_id TEXT NOT NULL,                 -- company identifier in the ATS
  website TEXT,
  logo_url TEXT,
  description TEXT,
  stage TEXT,                           -- 'pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'series-d+', 'unicorn', 'public'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,           -- ID from the ATS
  title TEXT NOT NULL,
  location TEXT,
  description TEXT,
  url TEXT NOT NULL,
  department TEXT,
  employment_type TEXT,                -- 'full-time', 'part-time', 'contract', etc.
  published_at TIMESTAMPTZ,            -- when the job was published on the ATS
  is_active BOOLEAN DEFAULT true,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, external_id)      -- prevent duplicate jobs per company
);

-- Indexes
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_last_seen_at ON jobs(last_seen_at);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_is_active ON companies(is_active);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed initial companies
INSERT INTO companies (name, slug, ats_provider, ats_id, website, description) VALUES
  ('Khan Academy', 'khan-academy', 'greenhouse', 'khanacademy', 'https://www.khanacademy.org', 'Free, world-class education for anyone, anywhere.'),
  ('Brilliant', 'brilliant', 'lever', 'brilliant', 'https://brilliant.org', 'Learn to think. Build quantitative skills in math, science, and computer science.'),
  ('Replit', 'replit', 'ashby', 'replit', 'https://replit.com', 'Build software collaboratively from anywhere in the world, on any device.');
