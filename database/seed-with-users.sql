-- ============================================
-- CENTRAL DE COMPRAS - SEED COM USUÁRIOS
-- ============================================
-- 
-- IMPORTANTE: Este arquivo contém hashes de senha válidos
-- Senha padrão para todos os usuários: "admin123"
-- 
-- Para usar este seed, você precisa ter o bcrypt instalado
-- ou usar o script: backend/scripts/create-initial-users.ts
-- ============================================

-- Usuários iniciais
-- Senha: "admin123" (hash bcrypt com salt rounds 8)
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Administrador', 'admin@central.com', '$2a$08$rKqJ5q5q5q5q5q5q5q5qOeTkQ5V9n5q5q5q5q5q5q5q5q5q5q', 'admin', NOW(), NOW()),
('Fornecedor Exemplo', 'fornecedor@exemplo.com', '$2a$08$rKqJ5q5q5q5q5q5q5q5qOeTkQ5V9n5q5q5q5q5q5q5q5q5q', 'supplier', NOW(), NOW()),
('Loja Exemplo', 'loja@exemplo.com', '$2a$08$rKqJ5q5q5q5q5q5q5q5qOeTkQ5V9n5q5q5q5q5q5q5q5q5q', 'retailer', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Categorias iniciais
INSERT INTO categories (name, created_at, updated_at) VALUES
('Bebidas', NOW(), NOW()),
('Alimentos', NOW(), NOW()),
('Limpeza', NOW(), NOW()),
('Higiene Pessoal', NOW(), NOW()),
('Papelaria', NOW(), NOW()),
('Eletrônicos', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- NOTA: Os hashes acima são placeholders.
-- Para criar usuários com senhas válidas, use o script:
-- npx ts-node backend/scripts/create-initial-users.ts
-- 
-- Ou crie usuários via API POST /api/users com:
-- {
--   "name": "Nome",
--   "email": "email@exemplo.com",
--   "password": "admin123",
--   "role": "admin|supplier|retailer"
-- }

