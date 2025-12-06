-- Script para debugar problemas com fornecedores

-- 1. Listar todos os usuários com role supplier
SELECT id, name, email, role FROM users WHERE role = 'supplier';

-- 2. Listar todos os fornecedores com suas relações de usuário
SELECT s.id, s.legal_name, s.user_id FROM suppliers s;

-- 3. Listar fornecedores que têm user_id NULL
SELECT s.id, s.legal_name FROM suppliers s WHERE s.user_id IS NULL;

-- 4. Verificar se há desconexões entre users e suppliers
SELECT u.id, u.name, u.email, COUNT(s.id) as supplier_count
FROM users u
LEFT JOIN suppliers s ON s.user_id = u.id
WHERE u.role = 'supplier'
GROUP BY u.id, u.name, u.email;

-- 5. Se encontrar usuários sem fornecedor, criar um padrão
-- (Execute apenas se necessário)
-- INSERT INTO suppliers (user_id, legal_name, trade_name, state, category, created_at, updated_at)
-- SELECT u.id, u.name, u.name, 'SP', 'Geral', NOW(), NOW()
-- FROM users u
-- WHERE u.role = 'supplier' AND u.id NOT IN (SELECT user_id FROM suppliers WHERE user_id IS NOT NULL);
