-- ========================================================
-- Personalized Travel Itinerary Planner Database Schema
-- Supabase / PostgreSQL Schema Definition
-- ========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    preferred_currency TEXT DEFAULT 'INR',
    preferred_style TEXT DEFAULT 'Balanced',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 1,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    travelers INTEGER NOT NULL DEFAULT 1,
    travel_style TEXT NOT NULL DEFAULT 'Balanced',
    travel_pace TEXT NOT NULL DEFAULT 'Balanced',
    accommodation TEXT NOT NULL DEFAULT 'Standard',
    status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'ongoing', 'completed'
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    travel_style TEXT NOT NULL,
    interests TEXT[] NOT NULL DEFAULT '{}',
    travel_pace TEXT NOT NULL,
    special_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ITINERARIES TABLE
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    accommodation_cost NUMERIC(12, 2) DEFAULT 0,
    food_cost NUMERIC(12, 2) DEFAULT 0,
    transport_cost NUMERIC(12, 2) DEFAULT 0,
    activity_cost NUMERIC(12, 2) DEFAULT 0,
    summary TEXT,
    travel_tips JSONB DEFAULT '[]'::jsonb,
    accommodation_recommendation JSONB DEFAULT '{}'::jsonb,
    transportation_options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ITINERARY DAYS TABLE
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE,
    theme TEXT NOT NULL DEFAULT 'Exploring the City',
    daily_cost NUMERIC(12, 2) DEFAULT 0,
    lunch_spot TEXT,
    dinner_spot TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    time TEXT NOT NULL, -- e.g. "09:00 AM"
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Sightseeing', -- 'Sightseeing', 'Food', 'Adventure', 'Shopping', 'Relaxation', 'Transport'
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'organizer', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) policies can be enabled when auth is linked
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon reads/writes for testing purposes
CREATE POLICY "Allow public read access to trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Allow public write access to trips" ON public.trips FOR ALL USING (true);

CREATE POLICY "Allow public read access to itineraries" ON public.itineraries FOR SELECT USING (true);
CREATE POLICY "Allow public write access to itineraries" ON public.itineraries FOR ALL USING (true);

CREATE POLICY "Allow public read access to days" ON public.itinerary_days FOR SELECT USING (true);
CREATE POLICY "Allow public write access to days" ON public.itinerary_days FOR ALL USING (true);

CREATE POLICY "Allow public read access to activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Allow public write access to activities" ON public.activities FOR ALL USING (true);

