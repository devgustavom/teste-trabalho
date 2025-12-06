# 🚀 Setup Inicial - Central de Compras

## Passo a Passo para Configurar o Sistema

### 1️⃣ Configurar Variáveis de Ambiente

Crie o arquivo `backend/.env` com:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_postgres
DB_DATABASE=central_compras
JWT_SECRET=seu_secret_jwt_aqui_qualquer_string_longa
PORT=3333
```

### 2️⃣ Instalar Dependências

```bash
cd backend
npm install
```

### 3️⃣ Criar Banco de Dados e Tabelas

**Opção A: Script Automático (Recomendado)**

```bash
node scripts/setup-database.js
```

Este script:
- Cria o banco de dados se não existir
- Executa o schema.sql automaticamente
- Verifica se tudo está OK

**Opção B: Manual**

```bash
# 1. Criar banco de dados
psql -U postgres -c "CREATE DATABASE central_compras;"

# 2. Executar schema
psql -U postgres -d central_compras -f ../database/schema.sql
```

### 4️⃣ Criar Usuários Iniciais

```bash
node scripts/create-users-simple.js
```

### 5️⃣ Iniciar o Servidor Backend

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3333`

### 6️⃣ Iniciar o Frontend

Em outro terminal:

```bash
cd ../client
npm install
npm run dev
```

O frontend estará rodando em: `http://localhost:5173` (ou outra porta)

## ✅ Verificação

Após executar os scripts, você deve ter:

1. ✅ Banco de dados `central_compras` criado
2. ✅ Todas as tabelas criadas (users, stores, suppliers, products, etc.)
3. ✅ 3 usuários criados:
   - `admin@central.com` / `admin123`
   - `fornecedor@exemplo.com` / `admin123`
   - `loja@exemplo.com` / `admin123`

## 🔍 Troubleshooting

### Erro: "relação users não existe"
- Execute: `node scripts/setup-database.js`

### Erro: "banco de dados não existe"
- O script `setup-database.js` cria automaticamente
- Ou crie manualmente: `CREATE DATABASE central_compras;`

### Erro de conexão com PostgreSQL
- Verifique se o PostgreSQL está rodando
- Verifique as credenciais no `.env`
- Teste: `psql -U postgres -c "SELECT version();"`

### Erro ao executar schema.sql
- Verifique se o arquivo existe em `database/schema.sql`
- Execute manualmente no psql se necessário

## 📋 Próximos Passos

Após o setup:
1. Faça login com `admin@central.com` / `admin123`
2. Crie fornecedores e lojas via interface
3. Configure produtos e campanhas
4. Comece a usar o sistema!

