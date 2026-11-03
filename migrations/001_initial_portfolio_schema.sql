-- Migration: 001_initial_portfolio_schema.sql
-- Description: Complete portfolio relational database schema for Neon PostgreSQL

-- Enable pgcrypto for gen_random_uuid() if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 0. Reusable updated_at Trigger Function
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  professional_title VARCHAR(255) NOT NULL,
  headline TEXT,
  short_bio TEXT,
  about TEXT,
  location VARCHAR(255),
  public_email VARCHAR(255),
  phone VARCHAR(50),
  profile_image_url TEXT,
  hero_image_url TEXT,
  resume_url TEXT,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 2. SITE_SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(150) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  description TEXT NOT NULL,
  problem_statement TEXT,
  solution TEXT,
  cover_image_url TEXT,
  github_url TEXT,
  live_demo_url TEXT,
  featured BOOLEAN DEFAULT false NOT NULL,
  published BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_featured_order ON projects (featured DESC, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (published);

CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. PROJECT_TECHNOLOGIES
CREATE TABLE IF NOT EXISTS project_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  CONSTRAINT uq_project_tech UNIQUE(project_id, technology_name)
);

CREATE INDEX IF NOT EXISTS idx_project_tech_project_id ON project_technologies(project_id);

-- 5. SKILL_CATEGORIES
CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skill_categories_order ON skill_categories(display_order ASC);

CREATE TRIGGER trg_skill_categories_updated_at
BEFORE UPDATE ON skill_categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 6. SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  proficiency_level VARCHAR(50),
  is_highlight BOOLEAN DEFAULT false NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_category_skill_name UNIQUE(category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_skills_category_id ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills(display_order ASC);

CREATE TRIGGER trg_skills_updated_at
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 7. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  description TEXT NOT NULL,
  achievement_date VARCHAR(50),
  position VARCHAR(100),
  certificate_url TEXT,
  credential_url TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  connected_to TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false NOT NULL,
  published BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_achievements_order ON achievements(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_achievements_published ON achievements(published);

CREATE TRIGGER trg_achievements_updated_at
BEFORE UPDATE ON achievements
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 8. EXPERIENCES
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  employment_type VARCHAR(100) DEFAULT 'Full-time',
  description TEXT,
  location VARCHAR(255),
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  currently_working BOOLEAN DEFAULT false NOT NULL,
  organization_logo_url TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_experiences_order ON experiences(display_order ASC);

CREATE TRIGGER trg_experiences_updated_at
BEFORE UPDATE ON experiences
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 9. EDUCATION
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  branch VARCHAR(255),
  start_year VARCHAR(20),
  end_year VARCHAR(20),
  grade VARCHAR(50),
  description TEXT,
  institution_logo_url TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_education_order ON education(display_order ASC);

CREATE TRIGGER trg_education_updated_at
BEFORE UPDATE ON education
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 10. CODING_PROFILES
CREATE TABLE IF NOT EXISTS coding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  profile_url TEXT NOT NULL,
  rating INTEGER DEFAULT 0,
  rank VARCHAR(100),
  total_solved INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coding_profiles_order ON coding_profiles(display_order ASC);

CREATE TRIGGER trg_coding_profiles_updated_at
BEFORE UPDATE ON coding_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 11. CODING_STATS_HISTORY
CREATE TABLE IF NOT EXISTS coding_stats_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coding_profile_id UUID NOT NULL REFERENCES coding_profiles(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  rating INTEGER,
  total_solved INTEGER,
  metrics JSONB DEFAULT '{}'::jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coding_stats_history_profile_date ON coding_stats_history(coding_profile_id, recorded_at DESC);

-- 12. SOCIAL_LINKS
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(100),
  profile_url TEXT NOT NULL,
  icon VARCHAR(100),
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_links_order ON social_links(display_order ASC);

CREATE TRIGGER trg_social_links_updated_at
BEFORE UPDATE ON social_links
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 13. CONTACT_MESSAGES (Migrate / harmonize existing table to fully support status, sender fields, etc.)
DO $$
BEGIN
  -- If table already exists from starter, add missing columns safely
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'sender_name') THEN
      ALTER TABLE contact_messages ADD COLUMN sender_name VARCHAR(255);
      UPDATE contact_messages SET sender_name = name WHERE sender_name IS NULL;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'sender_email') THEN
      ALTER TABLE contact_messages ADD COLUMN sender_email VARCHAR(255);
      UPDATE contact_messages SET sender_email = email WHERE sender_email IS NULL;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'subject') THEN
      ALTER TABLE contact_messages ADD COLUMN subject VARCHAR(255) DEFAULT 'Portfolio Contact';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'status') THEN
      ALTER TABLE contact_messages ADD COLUMN status VARCHAR(50) DEFAULT 'new';
      UPDATE contact_messages SET status = CASE WHEN read = true THEN 'read' ELSE 'new' END WHERE status IS NULL;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'read_at') THEN
      ALTER TABLE contact_messages ADD COLUMN read_at TIMESTAMPTZ;
    END IF;
  ELSE
    CREATE TABLE contact_messages (
      id TEXT PRIMARY KEY,
      sender_name VARCHAR(255) NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) DEFAULT 'Portfolio Contact',
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'new' NOT NULL,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- 14. MEDIA_ASSETS
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  bucket_name VARCHAR(100) DEFAULT 'assets' NOT NULL,
  object_key TEXT UNIQUE NOT NULL,
  file_type VARCHAR(50),
  mime_type VARCHAR(100),
  file_size BIGINT,
  alt_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_assets_bucket_key ON media_assets(bucket_name, object_key);

CREATE TRIGGER trg_media_assets_updated_at
BEFORE UPDATE ON media_assets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

