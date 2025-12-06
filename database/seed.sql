-- ============================================
-- CENTRAL DE COMPRAS - DADOS INICIAIS (SEED)
-- ============================================

-- Senha padrão: "admin123" (hash bcrypt)
INSERT INTO users (name, email, password, role) VALUES
('Administrador', 'admin@central.com', '$2a$08$K7L/JOYvqYFzYtjcNKzxeOeTkQ5V9n5q5q5q5q5q5q5q5q5q5q5q', 'admin'),
('Fornecedor Exemplo', 'fornecedor@exemplo.com', '$2a$08$K7L/JOYvqYFzYtjcNKzxeOeTkQ5V9n5q5q5q5q5q5q5q5q5q5q', 'supplier'),
('Loja Exemplo', 'loja@exemplo.com', '$2a$08$K7L/JOYvqYFzYtjcNKzxeOeTkQ5V9n5q5q5q5q5q5q5q5q5q5q', 'store');

-- Categorias iniciais
INSERT INTO categories (name) VALUES
('Eletrônicos'),
('Roupas'),
('Alimentos'),
('Casa e Decoração'),
('Esportes');

-- Nota: Para usar este seed, você precisa gerar os hashes de senha corretos usando bcrypt
-- ou usar a funcionalidade de criação de usuários via API

