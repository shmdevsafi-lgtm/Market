-- ============================================================
-- SEED DATA FOR E-COMMERCE PLATFORM
-- Run this AFTER schema.sql
-- ============================================================

-- ============================================================
-- INSERT PATTERNS (Colors/Designs)
-- ============================================================
INSERT INTO public.patterns (name, primary_color, secondary_color) VALUES
('Red', '#FF0000', '#800000'),
('Blue', '#0000FF', '#000080'),
('Green', '#00AA00', '#006600'),
('Black', '#000000', '#333333'),
('White', '#FFFFFF', '#F0F0F0'),
('Navy', '#001F3F', '#003366'),
('Gold', '#FFD700', '#FFA500'),
('Silver', '#C0C0C0', '#A9A9A9'),
('Purple', '#800080', '#4B0082'),
('Orange', '#FFA500', '#FF8C00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- INSERT PRODUCTS (10 Products)
-- ============================================================
INSERT INTO public.products (name, description, detailed_description, base_price, image_url, category, is_active) VALUES
(
  'Premium Scout Backpack',
  'Durable 50L camping backpack',
  'Professional grade scout backpack with waterproof materials, multiple compartments, and ergonomic design. Perfect for long hiking trips and camping expeditions.',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  1500.00,
  'scout-camping',
  true
),
(
  'Medical First Aid Kit',
  'Complete emergency medical kit',
  'Comprehensive first aid kit containing essential medical supplies, bandages, antiseptics, and emergency care items. Suitable for home, office, or outdoor use.',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=500&h=500&fit=crop',
  799.99,
  'medical',
  true
),
(
  'Scout Sleeping Bag',
  'Warm and comfortable sleeping bag',
  'High-quality sleeping bag with thermal insulation, weather-resistant exterior, and compact carry bag. Temperature rating: -5°C to 10°C.',
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=500&fit=crop',
  1299.99,
  'scout-camping',
  true
),
(
  'SHM Official Badge Set',
  'Authentic organization badges',
  'Complete set of official SHM badges representing different ranks and achievements. Perfect for uniform decoration and member recognition.',
  'https://images.unsplash.com/photo-1578365746567-e17c0e7d08c1?w=500&h=500&fit=crop',
  249.99,
  'shm',
  true
),
(
  'Digital Thermometer',
  'Fast and accurate temperature reading',
  'Non-contact infrared thermometer for quick temperature measurements. Digital display, automatic shutoff, and memory function for last reading.',
  'https://images.unsplash.com/photo-1631217314830-ead3ae80e143?w=500&h=500&fit=crop',
  399.99,
  'medical',
  true
),
(
  'Professional Tent 3-Person',
  'Waterproof camping tent',
  'Spacious 3-person tent with two doors, ventilation system, and waterproof floor. Easy to set up and includes carrying bag with stakes.',
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=500&fit=crop',
  2499.00,
  'scout-camping',
  true
),
(
  'Custom Print Stickers Pack',
  '100 custom printed stickers',
  'High-quality vinyl stickers, fully customizable with your design. Weather-resistant and suitable for laptops, water bottles, and outdoor use.',
  'https://images.unsplash.com/photo-1578365746567-e17c0e7d08c1?w=500&h=500&fit=crop',
  299.99,
  'projects',
  true
),
(
  'Starter Pack Gift Set',
  'Complete beginner gift collection',
  'Curated gift set perfect for beginners including essentials and premium items. Includes gift wrapping and personalized card.',
  'https://images.unsplash.com/photo-1513651857529-ef2be2838b10?w=500&h=500&fit=crop',
  1899.99,
  'packs',
  true
),
(
  'Professional Pottery Clay Kit',
  'Complete pottery crafting set',
  'Professional-grade pottery clay kit with all essential tools, instruction manual, and access to online tutorials. Perfect for beginners and professionals.',
  'https://images.unsplash.com/photo-1578365746567-e17c0e7d08c1?w=500&h=500&fit=crop',
  899.99,
  'projects',
  true
),
(
  'Emergency Survival Kit',
  'Complete survival essentials',
  'Comprehensive survival kit containing emergency supplies, water purification tablets, emergency whistle, fire starter, and more. Ideal for outdoor enthusiasts.',
  'https://images.unsplash.com/photo-1534368541277-c5ae56b9b4a0?w=500&h=500&fit=crop',
  1599.99,
  'scout-camping',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- INSERT VARIANTS (Sizes) FOR EACH PRODUCT
-- ============================================================
-- Product 1: Scout Backpack - by capacity/size
INSERT INTO public.variants (product_id, size, price, dimensions) 
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Premium Scout Backpack' LIMIT 1) as id,
    'Small (35L)' as size,
    1500.00 as price,
    '60x30x25cm' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Premium Scout Backpack' LIMIT 1),
    'Medium (50L)',
    1799.99,
    '70x35x30cm'
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Premium Scout Backpack' LIMIT 1),
    'Large (65L)',
    2099.99,
    '80x40x35cm'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 2: Medical First Aid Kit - by content level
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Medical First Aid Kit' LIMIT 1) as id,
    'Basic' as size,
    799.99 as price,
    '20x15x10cm' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Medical First Aid Kit' LIMIT 1),
    'Professional',
    1199.99,
    '30x20x15cm'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 3: Sleeping Bag - by season
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Scout Sleeping Bag' LIMIT 1) as id,
    'Summer' as size,
    999.99 as price,
    '80x200cm' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Scout Sleeping Bag' LIMIT 1),
    'Winter',
    1499.99,
    '85x210cm'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 4: Badge Set - by rank level
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'SHM Official Badge Set' LIMIT 1) as id,
    'Beginner' as size,
    249.99 as price,
    'Standard' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'SHM Official Badge Set' LIMIT 1),
    'Advanced',
    349.99,
    'Standard'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 5: Thermometer - by type
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Digital Thermometer' LIMIT 1) as id,
    'Standard' as size,
    399.99 as price,
    '10x5x2cm' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Digital Thermometer' LIMIT 1),
    'Premium',
    499.99,
    '12x6x2.5cm'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 6: Tent - by person capacity
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Professional Tent 3-Person' LIMIT 1) as id,
    '2-Person' as size,
    1999.99 as price,
    '200x150x120cm' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Professional Tent 3-Person' LIMIT 1),
    '3-Person',
    2499.00,
    '210x160x130cm'
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Professional Tent 3-Person' LIMIT 1),
    '4-Person',
    2999.99,
    '240x200x150cm'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 7: Stickers - by quantity
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Custom Print Stickers Pack' LIMIT 1) as id,
    '100 Stickers' as size,
    299.99 as price,
    'Standard' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Custom Print Stickers Pack' LIMIT 1),
    '500 Stickers',
    999.99,
    'Standard'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 8: Starter Pack - by gift level
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Starter Pack Gift Set' LIMIT 1) as id,
    'Bronze' as size,
    1899.99 as price,
    'Standard' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Starter Pack Gift Set' LIMIT 1),
    'Silver',
    2499.99,
    'Standard'
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Starter Pack Gift Set' LIMIT 1),
    'Gold',
    3499.99,
    'Premium'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 9: Pottery Kit - by skill level
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Professional Pottery Clay Kit' LIMIT 1) as id,
    'Beginner' as size,
    899.99 as price,
    'Standard' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Professional Pottery Clay Kit' LIMIT 1),
    'Professional',
    1499.99,
    'Premium'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- Product 10: Survival Kit - by size
INSERT INTO public.variants (product_id, size, price, dimensions)
SELECT id, size, price, dimensions FROM (
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Emergency Survival Kit' LIMIT 1) as id,
    'Personal' as size,
    1599.99 as price,
    '25x15x10cm' as dimensions
  UNION ALL
  SELECT 
    (SELECT id FROM public.products WHERE name = 'Emergency Survival Kit' LIMIT 1),
    'Family',
    2299.99,
    '35x25x15cm'
) t WHERE id IS NOT NULL ON CONFLICT DO NOTHING;

-- ============================================================
-- Verify data insertion
-- ============================================================
SELECT COUNT(*) as total_products FROM public.products;
SELECT COUNT(*) as total_variants FROM public.variants;
SELECT COUNT(*) as total_patterns FROM public.patterns;
