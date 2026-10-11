-- ============================================================================
-- SQL Migration: Create 5 Dedicated Report Tables for Each Assessment Form
-- Kids Care Rehab Centre
-- ============================================================================
-- This script creates 5 distinct report tables corresponding to the 5 assessment forms:
-- 1. reports_special_school       (for IEP / Special School Assessments)
-- 2. reports_asd                  (for Indian Scale for Assessment of Autism - ISAA)
-- 3. reports_adhd                 (for Conners' ADHD Rating Scale)
-- 4. reports_developmental_delay  (for Developmental Delay Milestone Checklist)
-- 5. reports_learning_disability  (for Learning Disability Screening Test - LDST)
-- ============================================================================

-- 1. REPORTS: SPECIAL SCHOOL / IEP
CREATE TABLE IF NOT EXISTS public.reports_special_school (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id VARCHAR(50) NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    assessment_id UUID,
    assessment_type VARCHAR(50) DEFAULT 'special_school',
    profile VARCHAR(20),
    profile_description TEXT,
    iep_cycle INT DEFAULT 1,
    iep_report JSONB,
    domain_scores JSONB,
    therapist_report JSONB,
    parent_report JSONB,
    therapy_details JSONB,
    clinic_exercises JSONB,
    home_exercises JSONB,
    status VARCHAR(30) DEFAULT 'draft',
    review_status VARCHAR(30) DEFAULT 'draft',
    next_review_date VARCHAR(50),
    prepared_by TEXT,
    prepared_by_id UUID,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    published_by TEXT,
    published_by_id UUID,
    published_at TIMESTAMPTZ,
    last_edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. REPORTS: AUTISM SPECTRUM DISORDER (ISAA)
CREATE TABLE IF NOT EXISTS public.reports_asd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id VARCHAR(50) NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    assessment_id UUID,
    assessment_type VARCHAR(50) DEFAULT 'asd',
    isaa_score NUMERIC,
    isaa_severity VARCHAR(100),
    isaa_level INT,
    isaa_section_scores JSONB,
    domain_scores JSONB,
    therapist_report JSONB,
    parent_report JSONB,
    therapy_details JSONB,
    clinic_exercises JSONB,
    home_exercises JSONB,
    status VARCHAR(30) DEFAULT 'draft',
    prepared_by TEXT,
    prepared_by_id UUID,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    published_by TEXT,
    published_by_id UUID,
    published_at TIMESTAMPTZ,
    last_edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. REPORTS: ADHD (CONNERS' RATING SCALE)
CREATE TABLE IF NOT EXISTS public.reports_adhd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id VARCHAR(50) NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    assessment_id UUID,
    assessment_type VARCHAR(50) DEFAULT 'adhd',
    conners_total_score NUMERIC,
    conners_t_score NUMERIC,
    conners_percentile NUMERIC,
    conners_severity VARCHAR(100),
    adhd_presentation VARCHAR(100),
    conners_subscales JSONB,
    domain_scores JSONB,
    therapist_report JSONB,
    parent_report JSONB,
    therapy_details JSONB,
    clinic_exercises JSONB,
    home_exercises JSONB,
    status VARCHAR(30) DEFAULT 'draft',
    prepared_by TEXT,
    prepared_by_id UUID,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    published_by TEXT,
    published_by_id UUID,
    published_at TIMESTAMPTZ,
    last_edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. REPORTS: DEVELOPMENTAL DELAY
CREATE TABLE IF NOT EXISTS public.reports_developmental_delay (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id VARCHAR(50) NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    assessment_id UUID,
    assessment_type VARCHAR(50) DEFAULT 'developmental_delay',
    delay_total_score NUMERIC,
    delay_severity VARCHAR(100),
    developmental_age VARCHAR(100),
    delay_domains JSONB,
    milestone_status JSONB,
    domain_scores JSONB,
    therapist_report JSONB,
    parent_report JSONB,
    therapy_details JSONB,
    clinic_exercises JSONB,
    home_exercises JSONB,
    status VARCHAR(30) DEFAULT 'draft',
    prepared_by TEXT,
    prepared_by_id UUID,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    published_by TEXT,
    published_by_id UUID,
    published_at TIMESTAMPTZ,
    last_edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. REPORTS: SPECIFIC LEARNING DISABILITY (LDST)
CREATE TABLE IF NOT EXISTS public.reports_learning_disability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id VARCHAR(50) NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    assessment_id UUID,
    assessment_type VARCHAR(50) DEFAULT 'learning_disability',
    ldst_total_score NUMERIC,
    ldst_severity VARCHAR(100),
    ldst_classification VARCHAR(150),
    ldst_subtest_scores JSONB,
    domain_scores JSONB,
    therapist_report JSONB,
    parent_report JSONB,
    therapy_details JSONB,
    clinic_exercises JSONB,
    home_exercises JSONB,
    status VARCHAR(30) DEFAULT 'draft',
    prepared_by TEXT,
    prepared_by_id UUID,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    published_by TEXT,
    published_by_id UUID,
    published_at TIMESTAMPTZ,
    last_edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rep_spec_child ON public.reports_special_school(child_id);
CREATE INDEX IF NOT EXISTS idx_rep_asd_child ON public.reports_asd(child_id);
CREATE INDEX IF NOT EXISTS idx_rep_adhd_child ON public.reports_adhd(child_id);
CREATE INDEX IF NOT EXISTS idx_rep_delay_child ON public.reports_developmental_delay(child_id);
CREATE INDEX IF NOT EXISTS idx_rep_ld_child ON public.reports_learning_disability(child_id);

-- Enable RLS and public policies (idempotent)
ALTER TABLE public.reports_special_school ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_asd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_adhd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_developmental_delay ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_learning_disability ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public read on reports_special_school" ON public.reports_special_school;
DROP POLICY IF EXISTS "Allow public write on reports_special_school" ON public.reports_special_school;
CREATE POLICY "Allow public read on reports_special_school" ON public.reports_special_school FOR SELECT USING (true);
CREATE POLICY "Allow public write on reports_special_school" ON public.reports_special_school FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on reports_asd" ON public.reports_asd;
DROP POLICY IF EXISTS "Allow public write on reports_asd" ON public.reports_asd;
CREATE POLICY "Allow public read on reports_asd" ON public.reports_asd FOR SELECT USING (true);
CREATE POLICY "Allow public write on reports_asd" ON public.reports_asd FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on reports_adhd" ON public.reports_adhd;
DROP POLICY IF EXISTS "Allow public write on reports_adhd" ON public.reports_adhd;
CREATE POLICY "Allow public read on reports_adhd" ON public.reports_adhd FOR SELECT USING (true);
CREATE POLICY "Allow public write on reports_adhd" ON public.reports_adhd FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on reports_developmental_delay" ON public.reports_developmental_delay;
DROP POLICY IF EXISTS "Allow public write on reports_developmental_delay" ON public.reports_developmental_delay;
CREATE POLICY "Allow public read on reports_developmental_delay" ON public.reports_developmental_delay FOR SELECT USING (true);
CREATE POLICY "Allow public write on reports_developmental_delay" ON public.reports_developmental_delay FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on reports_learning_disability" ON public.reports_learning_disability;
DROP POLICY IF EXISTS "Allow public write on reports_learning_disability" ON public.reports_learning_disability;
CREATE POLICY "Allow public read on reports_learning_disability" ON public.reports_learning_disability FOR SELECT USING (true);
CREATE POLICY "Allow public write on reports_learning_disability" ON public.reports_learning_disability FOR ALL USING (true);

-- Grant access to Supabase roles
GRANT ALL ON TABLE public.reports_special_school TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reports_asd TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reports_adhd TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reports_developmental_delay TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reports_learning_disability TO anon, authenticated, service_role;
