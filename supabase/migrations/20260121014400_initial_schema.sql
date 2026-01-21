-- =====================================================
-- EDUMERS LMS - Initial Database Schema Migration
-- =====================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'tutor', 'student');
CREATE TYPE tutor_status AS ENUM ('active', 'intern', 'leave', 'resigned');
CREATE TYPE degree_level AS ENUM ('s1', 's2', 's3');
CREATE TYPE service_type AS ENUM ('course', 'module', 'event', 'private_class');
CREATE TYPE category_type AS ENUM ('course', 'module', 'event');
CREATE TYPE event_type AS ENUM ('online', 'offline', 'hybrid');
CREATE TYPE private_class_status AS ENUM ('pending_payment', 'pending_match', 'active', 'completed', 'cancelled');
CREATE TYPE schedule_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'expired');
CREATE TYPE payment_gateway AS ENUM ('midtrans', 'xendit', 'manual');
CREATE TYPE holiday_type AS ENUM ('national', 'manual');

-- =====================================================
-- PROFILES
-- =====================================================

-- Main profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutor profiles
CREATE TABLE tutor_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    status tutor_status DEFAULT 'active',
    education JSONB,
    publications JSONB,
    achievements TEXT,
    expertise_areas TEXT[],
    default_meeting_link TEXT,
    whatsapp_group_link TEXT,
    hourly_rate DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    university VARCHAR(255),
    faculty VARCHAR(255),
    study_program VARCHAR(255),
    degree_level degree_level,
    enrollment_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    type category_type NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_slug ON categories(slug);

-- =====================================================
-- COURSES
-- =====================================================

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    thumbnail_url TEXT,
    price DECIMAL(12,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    content TEXT,
    sort_order INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);

-- =====================================================
-- MODULES
-- =====================================================

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    content TEXT,
    thumbnail_url TEXT,
    file_url TEXT,
    price DECIMAL(12,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_modules_published ON modules(is_published);

-- =====================================================
-- EVENTS
-- =====================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    thumbnail_url TEXT,
    event_type event_type NOT NULL,
    location TEXT,
    meeting_link TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_participants INTEGER,
    price DECIMAL(12,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_published ON events(is_published);

-- =====================================================
-- HOLIDAYS
-- =====================================================

CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type holiday_type NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_holidays_date ON holidays(date);

-- =====================================================
-- PRIVATE CLASS SYSTEM
-- =====================================================

-- Private class packages
CREATE TABLE private_class_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    duration_days INTEGER NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    tutor_fee_permanent DECIMAL(12,2) DEFAULT 0,
    tutor_fee_intern DECIMAL(12,2) DEFAULT 0,
    max_consultations INTEGER DEFAULT 0,
    benefits_template JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_private_class_packages_active ON private_class_packages(is_active);

-- Private classes (instances)
CREATE TABLE private_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES private_class_packages(id) ON DELETE SET NULL,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE SET NULL,
    transaction_id UUID,
    status private_class_status DEFAULT 'pending_payment',
    research_title TEXT,
    research_method TEXT,
    current_challenges TEXT,
    whatsapp_group_link TEXT,
    meeting_link TEXT,
    start_date DATE,
    end_date DATE,
    actual_end_date DATE,
    matched_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    matched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_private_classes_student ON private_classes(student_id);
CREATE INDEX idx_private_classes_tutor ON private_classes(tutor_id);
CREATE INDEX idx_private_classes_status ON private_classes(status);

-- Private class benefits
CREATE TABLE private_class_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    private_class_id UUID REFERENCES private_classes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_benefits_private_class ON private_class_benefits(private_class_id);

-- =====================================================
-- CONSULTATION SCHEDULES
-- =====================================================

CREATE TABLE consultation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    private_class_id UUID REFERENCES private_classes(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status schedule_status DEFAULT 'requested',
    notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure exclusive tutor slots (1 tutor per time slot)
CREATE UNIQUE INDEX idx_unique_tutor_schedule 
ON consultation_schedules(tutor_id, scheduled_date, start_time)
WHERE status != 'cancelled';

CREATE INDEX idx_schedules_tutor ON consultation_schedules(tutor_id);
CREATE INDEX idx_schedules_student ON consultation_schedules(student_id);
CREATE INDEX idx_schedules_date ON consultation_schedules(scheduled_date);

-- =====================================================
-- STUDENT TASKS
-- =====================================================

CREATE TABLE student_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    private_class_id UUID REFERENCES private_classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_student ON student_tasks(student_id);
CREATE INDEX idx_tasks_private_class ON student_tasks(private_class_id);

-- =====================================================
-- REVIEWS
-- =====================================================

CREATE TABLE tutor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    private_class_id UUID REFERENCES private_classes(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_tutor ON tutor_reviews(tutor_id);
CREATE INDEX idx_reviews_student ON tutor_reviews(student_id);

-- =====================================================
-- TRANSACTIONS
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    service_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status transaction_status DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_gateway payment_gateway,
    gateway_reference VARCHAR(255),
    paid_at TIMESTAMPTZ,
    invoice_number VARCHAR(50) UNIQUE,
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_service ON transactions(service_type, service_id);

-- Add foreign key to private_classes
ALTER TABLE private_classes 
ADD CONSTRAINT fk_private_classes_transaction 
FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;

-- =====================================================
-- ENROLLMENTS
-- =====================================================

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    service_id UUID NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_service ON enrollments(service_type, service_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate end date based on working days
CREATE OR REPLACE FUNCTION calculate_end_date(
    p_start_date DATE,
    p_working_days INTEGER
) RETURNS DATE AS $$
DECLARE
    v_current_date DATE := p_start_date;
    v_days_counted INTEGER := 0;
BEGIN
    WHILE v_days_counted < p_working_days LOOP
        v_current_date := v_current_date + 1;
        -- Skip weekends (Saturday=6, Sunday=0)
        IF EXTRACT(DOW FROM v_current_date) NOT IN (0, 6) THEN
            -- Skip holidays
            IF NOT EXISTS (SELECT 1 FROM holidays WHERE date = v_current_date) THEN
                v_days_counted := v_days_counted + 1;
            END IF;
        END IF;
    END LOOP;
    RETURN v_current_date;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_profiles_updated_at BEFORE UPDATE ON tutor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_classes_updated_at BEFORE UPDATE ON private_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, role, full_name, email)
    VALUES (
        NEW.id,
        'student', -- default role
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_class_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_class_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Tutor profiles policies
CREATE POLICY "Public can view active tutors" ON tutor_profiles
    FOR SELECT USING (status = 'active');

CREATE POLICY "Tutors can update own profile" ON tutor_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage tutor profiles" ON tutor_profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Student profiles policies
CREATE POLICY "Students can view own profile" ON student_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own profile" ON student_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage student profiles" ON student_profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Categories policies
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Courses policies
CREATE POLICY "Public can view published courses" ON courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON courses
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Course sections & lessons policies
CREATE POLICY "Public can view published course sections" ON course_sections
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM courses WHERE id = course_sections.course_id AND is_published = true)
    );

CREATE POLICY "Public can view published course lessons" ON course_lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_sections cs
            JOIN courses c ON c.id = cs.course_id
            WHERE cs.id = course_lessons.section_id AND c.is_published = true
        )
    );

CREATE POLICY "Admins can manage course sections" ON course_sections
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage course lessons" ON course_lessons
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Modules policies
CREATE POLICY "Public can view published modules" ON modules
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage modules" ON modules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Events policies
CREATE POLICY "Public can view published events" ON events
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Holidays policies
CREATE POLICY "Public can view holidays" ON holidays
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage holidays" ON holidays
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Private class packages policies
CREATE POLICY "Public can view active packages" ON private_class_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON private_class_packages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Private classes policies
CREATE POLICY "Students can view own private classes" ON private_classes
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Tutors can view assigned private classes" ON private_classes
    FOR SELECT USING (tutor_id = auth.uid());

CREATE POLICY "Admins can manage private classes" ON private_classes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Benefits policies
CREATE POLICY "Participants can view benefits" ON private_class_benefits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM private_classes pc
            WHERE pc.id = private_class_benefits.private_class_id
            AND (pc.student_id = auth.uid() OR pc.tutor_id = auth.uid())
        )
    );

CREATE POLICY "Tutors can update benefits" ON private_class_benefits
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM private_classes pc
            WHERE pc.id = private_class_benefits.private_class_id
            AND pc.tutor_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage benefits" ON private_class_benefits
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Consultation schedules policies
CREATE POLICY "Participants can view own schedules" ON consultation_schedules
    FOR SELECT USING (student_id = auth.uid() OR tutor_id = auth.uid());

CREATE POLICY "Students can request schedules" ON consultation_schedules
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Tutors can confirm schedules" ON consultation_schedules
    FOR UPDATE USING (tutor_id = auth.uid());

CREATE POLICY "Admins can manage schedules" ON consultation_schedules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Student tasks policies
CREATE POLICY "Students can view own tasks" ON student_tasks
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can manage own tasks" ON student_tasks
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Tutors can view student tasks" ON student_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM private_classes pc
            WHERE pc.id = student_tasks.private_class_id
            AND pc.tutor_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage tasks" ON student_tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Reviews policies
CREATE POLICY "Public can view reviews" ON tutor_reviews
    FOR SELECT USING (true);

CREATE POLICY "Students can create reviews" ON tutor_reviews
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage reviews" ON tutor_reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage transactions" ON transactions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Enrollments policies
CREATE POLICY "Students can view own enrollments" ON enrollments
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create enrollments" ON enrollments
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage enrollments" ON enrollments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
