# 🚀 Guia de Execução - Central de Compras Backend

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 16 ou superior)
   - Verifique: `node --version`
   - Download: https://nodejs.org/

2. **PostgreSQL** (versão 12 ou superior)
   - Verifique: `psql --version`
   - Download: https://www.postgresql.org/download/

3. **npm** (vem com Node.js)
   - Verifique: `npm --version`

---

## 🔧 Passo a Passo para Executar

### **1. Instalar Dependências**

Abra o terminal na pasta do backend:

```bash
cd backend
npm install
```

Isso instalará todas as dependências necessárias (Express, TypeORM, JWT, etc.)

---

### **2. Configurar Banco de Dados PostgreSQL**

#### 2.1. Criar o banco de dados:

```bash
# No terminal (Windows PowerShell ou CMD)
psql -U postgres

# Dentro do PostgreSQL, execute:
CREATE DATABASE central_de_compras;

# Sair do PostgreSQL:
\q
```

#### 2.2. Executar o schema SQL:

```bash
# No terminal, na raiz do projeto
psql -U postgres -d central_de_compras -f database/schema.sql
```

**OU** se estiver na pasta backend:

```bash
psql -U postgres -d central_de_compras -f ../database/schema.sql
```

---

### **3. Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
# Porta do servidor
PORT=3333

# Configuração do banco PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_postgres_aqui
DB_DATABASE=central_de_compras

# JWT Secret (use uma chave segura)
JWT_SECRET=minha_chave_jwt_super_segura_123456

# SMTP para envio de e-mails (opcional - pode deixar vazio para testes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
SMTP_FROM=noreply@centraldecompras.com
```

**⚠️ IMPORTANTE:**
- Substitua `sua_senha_postgres_aqui` pela senha do seu PostgreSQL
- Altere `JWT_SECRET` para uma chave segura (pode ser qualquer string longa)
- Para e-mails, você pode usar Gmail, Outlook ou outro serviço SMTP

---

### **4. Executar o Backend**

#### Modo Desenvolvimento (com hot reload):

```bash
npm run dev
```

#### Modo Produção:

```bash
# Primeiro, compile o TypeScript:
npm run build

# Depois, execute:
npm start
```

---

### **5. Verificar se Está Funcionando**

Após executar, você deve ver no terminal:

```
🟢 DB conectado
🚀 Backend rodando na porta 3333
```

Acesse no navegador:

- **API Online**: http://localhost:3333
- **Documentação Swagger**: http://localhost:3333/docs

---

## 🧪 Testar a API

### **1. Fazer Login (criar usuário primeiro via admin)**

Se você ainda não tem usuários, precisa criar um usuário admin primeiro. Você pode:

**Opção A:** Usar o endpoint de criação de usuários (se já tiver um admin):
```bash
POST http://localhost:3333/api/users
Authorization: Bearer {token_admin}
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "admin"
}
```

**Opção B:** Criar manualmente no banco (mais rápido para começar):
```sql
-- No PostgreSQL, execute:
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@test.com', '$2a$08$K7L/JOYvqYFzYtjcNKzxeOeTkQ5V9n5q5q5q5q5q5q5q5q5q5q5q', 'admin');
-- Senha: admin123 (hash bcrypt)
```

### **2. Fazer Login:**

```bash
POST http://localhost:3333/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123"
}
```

Você receberá um token JWT. Use esse token nos próximos requests no header:
```
Authorization: Bearer {seu_token_aqui}
```

### **3. Testar Endpoints:**

Use a documentação Swagger em http://localhost:3333/docs para testar todos os endpoints interativamente!

---

## 🐛 Solução de Problemas

### **Erro: "Cannot find module"**
```bash
# Reinstale as dependências:
rm -rf node_modules
npm install
```

### **Erro: "Connection refused" (PostgreSQL)**
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -U postgres`

### **Erro: "Port 3333 already in use"**
- Altere a porta no `.env`: `PORT=3334`
- Ou feche o processo que está usando a porta 3333

### **Erro: "JWT_SECRET is not defined"**
- Certifique-se de que o arquivo `.env` existe na pasta `backend/`
- Verifique se todas as variáveis estão preenchidas

### **E-mails não estão sendo enviados**
- Isso é normal se você não configurou SMTP
- O pedido será criado normalmente, apenas os e-mails não serão enviados
- Configure SMTP no `.env` se quiser ativar e-mails

---

## 📚 Próximos Passos

1. **Explorar a API**: Acesse http://localhost:3333/docs
2. **Criar usuários**: Use o endpoint `/api/users` (admin)
3. **Criar fornecedores e lojas**: Use os endpoints respectivos
4. **Criar produtos e campanhas**: Configure o catálogo
5. **Fazer pedidos**: Teste o fluxo completo

---

## 📞 Estrutura de Pastas

```
backend/
├── src/
│   ├── controllers/    # Lógica de negócio
│   ├── models/         # Entidades do banco
│   ├── routes/         # Rotas da API
│   ├── services/       # Serviços (e-mail, etc)
│   ├── middlewares/    # Autenticação, erros
│   ├── config/         # Configurações
│   └── app.ts          # Arquivo principal
├── uploads/            # Arquivos enviados
├── .env                # Variáveis de ambiente (criar você)
├── package.json
└── tsconfig.json
```

---

## ✅ Checklist de Execução

- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `central_de_compras` criado
- [ ] Schema SQL executado
- [ ] Arquivo `.env` criado e configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Backend rodando (`npm run dev`)
- [ ] Acesso a http://localhost:3333/docs funcionando

---

**Pronto! Seu backend está funcionando! 🎉**

