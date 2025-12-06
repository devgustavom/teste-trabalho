# 🔧 Solução para Erro HTTP 500

## Problema
Erro HTTP 500 ao tentar criar usuários ou fazer login.

## Soluções

### ✅ Solução 1: Usar o Script Node.js Corrigido (Recomendado)

```bash
cd backend
npx ts-node scripts/create-initial-users.ts
```

Este script:
- Usa a mesma configuração do projeto (`AppDataSource`)
- Faz hash automático da senha (o modelo User faz isso)
- Verifica se usuários já existem

### ✅ Solução 2: Script JavaScript Simples

```bash
cd backend
node scripts/create-users-simple.js
```

### ✅ Solução 3: SQL Direto (se os hashes estiverem corretos)

Execute no PostgreSQL:

```sql
-- Verificar se a tabela existe
SELECT * FROM users LIMIT 1;

-- Inserir usuários (você precisa gerar os hashes corretos)
-- Use o script Node.js para gerar hashes válidos
```

### ✅ Solução 4: Criar via API (após corrigir o UserController)

Se o servidor estiver rodando e você tiver um token de admin:

```bash
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Administrador",
    "email": "admin@central.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## Verificações

### 1. Verificar se o banco está rodando
```bash
# No PostgreSQL
psql -U postgres -d central_compras -c "SELECT version();"
```

### 2. Verificar variáveis de ambiente
Certifique-se de que o arquivo `.env` existe em `backend/` com:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=central_compras
JWT_SECRET=seu_secret_aqui
```

### 3. Verificar se a tabela users existe
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'users';
```

### 4. Verificar logs do servidor
Execute o backend e veja os erros:

```bash
cd backend
npm run dev
```

## Credenciais Padrão (após criar usuários)

- **Admin:** `admin@central.com` / `admin123`
- **Fornecedor:** `fornecedor@exemplo.com` / `admin123`
- **Loja:** `loja@exemplo.com` / `admin123`

## Se ainda der erro

1. Verifique os logs do servidor backend
2. Verifique se o banco de dados está acessível
3. Verifique se todas as dependências estão instaladas: `npm install`
4. Verifique se o TypeORM está sincronizado com o banco

