-- Enable Row Level Security
-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'provider')),
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create providers table
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    category TEXT NOT NULL,
    service TEXT NOT NULL,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    prices JSONB DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    service_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    description TEXT NOT NULL,
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    location_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_category ON public.providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_service ON public.providers(service);
CREATE INDEX IF NOT EXISTS idx_providers_location ON public.providers(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON public.providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_providers_available ON public.providers(is_available);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_client ON public.service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_provider ON public.service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers can be read by anyone, but only updated by owner
CREATE POLICY "Providers are viewable by everyone" ON public.providers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own provider profile" ON public.providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provider profile" ON public.providers
    FOR UPDATE USING (auth.uid() = user_id);

-- Reviews can be read by anyone, created by authenticated users
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Service requests can be viewed and managed by involved parties
CREATE POLICY "Users can view related service requests" ON public.service_requests
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() IN (SELECT user_id FROM public.providers WHERE id = provider_id)
    );

CREATE POLICY "Clients can create service requests" ON public.service_requests
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Involved parties can update service requests" ON public.service_requests
    FOR UPDATE USING (
        auth.uid() = client_id OR 
        auth.uid() IN (SELECT user_id FROM public.providers WHERE id = provider_id)
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
