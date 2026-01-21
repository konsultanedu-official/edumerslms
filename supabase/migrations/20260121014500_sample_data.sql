-- =====================================================
-- EDUMERS LMS - Sample Data for Testing
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, slug, type, description, is_active) VALUES
('Metodologi Penelitian', 'metodologi-penelitian', 'course', 'Kursus tentang metodologi penelitian', true),
('Statistika', 'statistika', 'course', 'Kursus statistika untuk penelitian', true),
('Panduan Skripsi', 'panduan-skripsi', 'module', 'Modul panduan penulisan skripsi', true),
('Template Penelitian', 'template-penelitian', 'module', 'Template dokumen penelitian', true),
('Webinar Akademik', 'webinar-akademik', 'event', 'Webinar dan seminar akademik', true);

-- Insert sample holidays (2026)
INSERT INTO holidays (date, name, type) VALUES
('2026-01-01', 'Tahun Baru 2026', 'national'),
('2026-03-31', 'Hari Raya Idul Fitri', 'national'),
('2026-04-01', 'Hari Raya Idul Fitri', 'national'),
('2026-05-01', 'Hari Buruh Internasional', 'national'),
('2026-05-14', 'Kenaikan Isa Almasih', 'national'),
('2026-06-01', 'Hari Lahir Pancasila', 'national'),
('2026-06-08', 'Hari Raya Idul Adha', 'national'),
('2026-06-29', 'Tahun Baru Islam 1448 H', 'national'),
('2026-08-17', 'Hari Kemerdekaan RI', 'national'),
('2026-09-07', 'Maulid Nabi Muhammad SAW', 'national'),
('2026-12-25', 'Hari Raya Natal', 'national');

-- Insert sample private class packages
INSERT INTO private_class_packages (name, slug, description, duration_days, price, tutor_fee_permanent, tutor_fee_intern, max_consultations, benefits_template, is_active) VALUES
(
    'Paket Skripsi 1 Bulan',
    'paket-skripsi-1-bulan',
    'Bimbingan skripsi intensif selama 1 bulan (22 hari kerja)',
    22,
    1500000,
    800000,
    500000,
    8,
    '["Akses Turnitin", "Akses ChatGPT Premium", "Template Dokumen", "Review Berkala"]'::jsonb,
    true
),
(
    'Paket Skripsi 2 Bulan',
    'paket-skripsi-2-bulan',
    'Bimbingan skripsi komprehensif selama 2 bulan (44 hari kerja)',
    44,
    2500000,
    1400000,
    900000,
    16,
    '["Akses Turnitin", "Akses ChatGPT Premium", "Template Dokumen", "Review Berkala", "Konsultasi Statistik"]'::jsonb,
    true
),
(
    'Paket Tesis 1 Bulan',
    'paket-tesis-1-bulan',
    'Bimbingan tesis S2 selama 1 bulan (22 hari kerja)',
    22,
    2000000,
    1100000,
    700000,
    10,
    '["Akses Turnitin", "Akses ChatGPT Premium", "Template Dokumen", "Review Berkala", "Konsultasi Metodologi"]'::jsonb,
    true
);

-- Note: To insert actual users, tutors, and students, you need to:
-- 1. Create users through Supabase Auth (sign up)
-- 2. Update their role in profiles table
-- 3. Insert corresponding tutor_profiles or student_profiles

-- Example query to update a user to admin role (run after creating user):
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@edumers.com';

-- Example query to create tutor profile (after user exists):
-- INSERT INTO tutor_profiles (id, status, expertise_areas, hourly_rate)
-- SELECT id, 'active', ARRAY['Metodologi Penelitian', 'Statistika'], 150000
-- FROM profiles WHERE email = 'tutor@edumers.com';

-- Example query to create student profile (after user exists):
-- INSERT INTO student_profiles (id, university, faculty, study_program, degree_level)
-- SELECT id, 'Universitas Indonesia', 'Fakultas Ilmu Komputer', 'Sistem Informasi', 's1'
-- FROM profiles WHERE email = 'student@edumers.com';
