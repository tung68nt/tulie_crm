-- Update product descriptions to be concise, avoid repeating feature list
UPDATE products 
SET description = 'Chỉnh sửa cơ bản, phù hợp ảnh hồ sơ, xin việc, thẻ sinh viên.'
WHERE price = 79000 AND category = 'Studio';

UPDATE products 
SET description = 'Xử lý chuyên sâu, phù hợp ảnh CCCD, visa, hộ chiếu. Ghép trang phục chuyên nghiệp.'
WHERE price = 199000 AND category = 'Studio';

UPDATE products 
SET description = 'Hoàn thiện cao cấp mọi chi tiết, đa trang phục. Lý tưởng cho ảnh visa, hồ sơ quan trọng.'
WHERE price = 339000 AND category = 'Studio';
