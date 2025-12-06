-- ============================================
-- Script SQL para criar usuários iniciais
-- Execute este script diretamente no PostgreSQL
-- ============================================

-- IMPORTANTE: Este hash é apenas um exemplo
-- Para gerar um hash válido, você precisa usar bcrypt
-- Ou usar o script Node.js: backend/scripts/create-initial-users.ts

-- Hash da senha "admin123" (bcrypt, salt rounds 8)
-- Para gerar: bcrypt.hashSync("admin123", 8)

-- Primeiro, vamos criar uma função temporária para gerar o hash
-- OU você pode usar o script Node.js que já faz isso

-- Usuários iniciais
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Administrador', 'admin@central.com', '$2a$08$rKqJ5q5q5q5q5q5q5q5qOeTkQ5V9n5q5q5q5q5q5q5q5q5q', 'admin', NOW(), NOW()),
('Fornecedor Exemplo', 'fornecedor@exemplo.com', '$2a$08$rKqJ5q5q5q5q5q5q5q5qOeTkQ5V9n5q5q5q5q5q5q5q5q', 'supplier', NOW(), NOW()),
('Loja Exemplo', 'loja@exemplo.com', '$2a$08$rKqJ5q5q5q5q5q5q5q5qOeTkQ5V9n5q5q5q5q5q5q5q5q', 'retailer', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- NOTA: Os hashes acima são placeholders e podem não funcionar.
-- RECOMENDADO: Use o script Node.js que gera os hashes corretamente:
-- cd backend && npx ts-node scripts/create-initial-users.ts

