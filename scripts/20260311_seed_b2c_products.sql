-- Seed products for B2C module
INSERT INTO public.products (name, price, unit, category, is_active)
VALUES 
('Gói ảnh thẻ 79k', 79000, 'Gói', 'Studio', true),
('Gói ảnh thẻ 199k', 199000, 'Gói', 'Studio', true),
('Gói ảnh thẻ 339k', 339000, 'Gói', 'Studio', true),
('In ảnh A5', 15000, 'Cái', 'Printing', true),
('In ảnh A6 ép plastic', 10000, 'Cái', 'Printing', true)
ON CONFLICT (id) DO NOTHING;
