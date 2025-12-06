-- Script para criar novo admin
-- Email: admin2@central.com
-- Senha: admin123

INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
  'Administrador 2',
  'admin2@central.com',
  '$2b$08$.tg/iry.MOourSumiNOrVeHpGsrQMcAdmyDAszZIQ6.zK5yAjCJga',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se foi criado
SELECT id, name, email, role FROM users WHERE email = 'admin2@central.com';
