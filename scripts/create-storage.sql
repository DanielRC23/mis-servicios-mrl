-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public access to profile images
CREATE POLICY "Public can view profile images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-files' AND 
        (storage.foldername(name))[2] = 'profile.jpg'
    );
