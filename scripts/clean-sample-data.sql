-- Limpiar todos los datos de ejemplo
DELETE FROM public.reviews;
DELETE FROM public.service_requests;
DELETE FROM public.providers;
DELETE FROM public.users WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004'
);

-- Limpiar archivos de storage si existen
-- (Esto se debe hacer manualmente desde el panel de Supabase)
