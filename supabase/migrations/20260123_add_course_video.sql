-- =====================================================
-- EDUMERS LMS - Phase 1.4 Refactor
-- Focus: Course Video Support
-- =====================================================

-- 1. Add video fields to courses
ALTER TABLE courses
ADD COLUMN video_url TEXT,
ADD COLUMN video_type VARCHAR(50); -- 'youtube', 'drive', 'upload'

-- 2. Add description to events if missing (It was present in analysis, but double check)
-- Analysis showed: events has description. Good.

-- 3. Add link to modules if they need external resources
-- Analysis showed: modules has file_url and content. Good.
