# 🔐 Credenciais de Acesso - Central de Compras

## Como criar usuários iniciais

### Opção 1: Usando o script Node.js (Recomendado)

Execute o script que cria os usuários com senhas corretas:

```bash
cd backend
npx ts-node scripts/create-initial-users.ts
```

### Opção 2: Via API (após iniciar o servidor)

Faça uma requisição POST para criar um usuário:

```bash
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@central.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## 📋 Credenciais Padrão

Após executar o script, você pode usar as seguintes credenciais:

### 👤 Administrador
- **Email:** `admin@central.com`
- **Senha:** `admin123`
- **Perfil:** Administrador completo

### 🏢 Fornecedor
- **Email:** `fornecedor@exemplo.com`
- **Senha:** `admin123`
- **Perfil:** Fornecedor (pode criar produtos e campanhas)

### 🏪 Loja/Varejista
- **Email:** `loja@exemplo.com`
- **Senha:** `admin123`
- **Perfil:** Lojista (pode fazer pedidos)

## ⚠️ Importante

1. **Altere as senhas** após o primeiro acesso em produção
2. O script verifica se os usuários já existem antes de criar
3. Todos os usuários iniciais usam a senha padrão: `admin123`

## 🔄 Reset de Senha

Se precisar resetar uma senha, você pode:

1. Deletar o usuário e criar novamente via API
2. Atualizar diretamente no banco (não recomendado)
3. Usar o endpoint de atualização de usuário (se implementado)

