# 🔧 Correção do Erro HTTP 500 no Login

## Problemas Identificados

1. **AuthController usando `getRepository()` deprecated** - Corrigido ✅
2. **Tabelas não foram criadas corretamente** - Precisa executar schema novamente

## Solução

### Passo 1: Executar o Schema Corretamente

```bash
cd backend
node scripts/execute-schema.js
```

Este script:
- Executa o schema.sql corretamente
- Ignora erros de "já existe" (tabelas/índices duplicados)
- Mostra quais tabelas foram criadas
- Mais robusto que o anterior

### Passo 2: Verificar se as Tabelas Foram Criadas

```bash
# No PostgreSQL
psql -U postgres -d central_de_compras -c "\dt"
```

Você deve ver todas as tabelas:
- users
- stores
- suppliers
- products
- categories
- campaigns
- orders
- etc.

### Passo 3: Criar Usuários (se ainda não criou)

```bash
node scripts/create-users-simple.js
```

### Passo 4: Testar o Login

O `AuthController` foi corrigido para:
- ✅ Usar `AppDataSource.getRepository()` em vez de `getRepository()`
- ✅ Melhor tratamento de erros
- ✅ Validação de JWT_SECRET
- ✅ Logs de erro mais claros

## Verificações

### 1. Verificar se JWT_SECRET está configurado

No arquivo `backend/.env`:

```env
JWT_SECRET=seu_secret_aqui_qualquer_string_longa_e_segura
```

### 2. Verificar se o servidor está rodando

```bash
cd backend
npm run dev
```

### 3. Testar login via curl

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@central.com",
    "password": "admin123"
  }'
```

Deve retornar:
```json
{
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@central.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Se ainda der erro

1. Verifique os logs do servidor backend
2. Verifique se o banco está acessível
3. Verifique se as variáveis de ambiente estão corretas
4. Verifique se o JWT_SECRET está configurado

