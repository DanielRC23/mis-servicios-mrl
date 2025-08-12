-- Insert sample data for testing (optional)
-- This will help you test the app with some example providers

-- Sample providers data
INSERT INTO public.users (id, email, full_name, phone, user_type, profile_image) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'carlos.mendoza@email.com', 'Carlos Mendoza', '+52 443 123 4567', 'provider', null),
('550e8400-e29b-41d4-a716-446655440002', 'ana.garcia@email.com', 'Ana García', '+52 443 234 5678', 'provider', null),
('550e8400-e29b-41d4-a716-446655440003', 'roberto.silva@email.com', 'Roberto Silva', '+52 443 345 6789', 'provider', null),
('550e8400-e29b-41d4-a716-446655440004', 'maria.lopez@email.com', 'María López', '+52 443 456 7890', 'client', null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.providers (user_id, category, service, description, rating, total_reviews, total_clients, location_lat, location_lng, location_address, prices, availability, documents) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'hogar',
    'Plomero',
    'Plomero con 10 años de experiencia en reparaciones residenciales y comerciales. Especializado en instalaciones de agua, drenaje y gas.',
    4.8,
    127,
    89,
    19.7060,
    -101.1950,
    'Centro, Morelia, Michoacán',
    '{"hourly": 300, "description": "Desde $300/hora, diagnóstico gratuito"}',
    '{"monday": {"start": "08:00", "end": "18:00", "available": true}, "tuesday": {"start": "08:00", "end": "18:00", "available": true}, "wednesday": {"start": "08:00", "end": "18:00", "available": true}, "thursday": {"start": "08:00", "end": "18:00", "available": true}, "friday": {"start": "08:00", "end": "18:00", "available": true}, "saturday": {"start": "09:00", "end": "15:00", "available": true}, "sunday": {"start": "09:00", "end": "15:00", "available": false}}',
    '{"ine": {"front": "", "back": "", "verified": true}, "address_proof": {"url": "", "verified": true}}'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'personales',
    'Estilista a domicilio',
    'Estilista profesional con certificación internacional. Especializada en cortes modernos, colorimetría y tratamientos capilares.',
    4.9,
    203,
    156,
    19.7010,
    -101.1890,
    'Chapultepec Norte, Morelia, Michoacán',
    '{"fixed": 250, "description": "Desde $250/servicio, corte y peinado incluido"}',
    '{"monday": {"start": "09:00", "end": "19:00", "available": true}, "tuesday": {"start": "09:00", "end": "19:00", "available": true}, "wednesday": {"start": "09:00", "end": "19:00", "available": true}, "thursday": {"start": "09:00", "end": "19:00", "available": true}, "friday": {"start": "09:00", "end": "19:00", "available": true}, "saturday": {"start": "08:00", "end": "20:00", "available": true}, "sunday": {"start": "10:00", "end": "16:00", "available": true}}',
    '{"ine": {"front": "", "back": "", "verified": true}, "address_proof": {"url": "", "verified": true}}'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'reparaciones',
    'Técnico en computadoras',
    'Especialista en reparación de computadoras y laptops. Soporte técnico a domicilio, instalación de software y recuperación de datos.',
    4.7,
    94,
    67,
    19.7100,
    -101.2000,
    'Lomas de Hidalgo, Morelia, Michoacán',
    '{"hourly": 200, "description": "Desde $200/diagnóstico, reparación desde $400"}',
    '{"monday": {"start": "10:00", "end": "20:00", "available": true}, "tuesday": {"start": "10:00", "end": "20:00", "available": true}, "wednesday": {"start": "10:00", "end": "20:00", "available": true}, "thursday": {"start": "10:00", "end": "20:00", "available": true}, "friday": {"start": "10:00", "end": "20:00", "available": true}, "saturday": {"start": "10:00", "end": "18:00", "available": true}, "sunday": {"start": "10:00", "end": "18:00", "available": false}}',
    '{"ine": {"front": "", "back": "", "verified": true}, "address_proof": {"url": "", "verified": true}}'
)
ON CONFLICT (user_id) DO NOTHING;

-- Sample reviews
INSERT INTO public.reviews (provider_id, client_id, client_name, rating, comment, service_type) VALUES
(
    (SELECT id FROM public.providers WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'),
    '550e8400-e29b-41d4-a716-446655440004',
    'María López',
    5,
    'Excelente trabajo, muy profesional y puntual. Solucionó el problema de la tubería rápidamente.',
    'Reparación de tubería'
),
(
    (SELECT id FROM public.providers WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'),
    '550e8400-e29b-41d4-a716-446655440004',
    'María López',
    5,
    'Ana es increíble! Me encantó mi nuevo corte y el servicio a domicilio es muy conveniente.',
    'Corte y peinado'
)
ON CONFLICT DO NOTHING;
