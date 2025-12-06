# Central de Compras - Backend API

API REST completa para a plataforma Central de Compras, conectando lojistas e fornecedores em um marketplace B2B.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **TypeORM** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Swagger** - Documentação automática da API
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de e-mails (configurável)

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório e entre na pasta backend:**
```bash
cd backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do backend com:
```env
PORT=3333
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=central_de_compras
JWT_SECRET=sua_chave_jwt_segura_aqui
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=senha
SMTP_FROM=noreply@centraldecompras.com
```

4. **Crie o banco de dados:**
```bash
createdb central_de_compras
```

5. **Execute o schema SQL:**
```bash
psql -U postgres -d central_de_compras -f ../database/schema.sql
```

6. **Inicie o servidor:**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

## 📚 Documentação da API

Acesse a documentação Swagger em: **http://localhost:3333/docs**

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/     # Controllers REST
│   ├── models/          # Entidades TypeORM
│   ├── routes/          # Rotas da API
│   ├── middlewares/     # Middlewares (auth, error handler)
│   ├── config/          # Configurações (ORM, Swagger)
│   └── app.ts           # Arquivo principal
├── uploads/             # Arquivos enviados
└── package.json
```

## 🔐 Autenticação

Todos os endpoints (exceto `/api/auth/login`) requerem autenticação JWT.

**Login:**
```bash
POST /api/auth/login
{
  "email": "usuario@exemplo.com",
  "password": "senha"
}
```

**Resposta:**
```json
{
  "user": { "id": 1, "name": "...", "role": "store" },
  "token": "eyJhbGci..."
}
```

Use o token no header: `Authorization: Bearer {token}`

## 👥 Perfis de Usuário

- **admin**: Acesso total ao sistema
- **supplier**: Fornecedor - gerencia produtos, campanhas, condições regionais
- **store**: Lojista - faz pedidos, consulta cashback
- **telemarketing**: Perfil opcional para atendimento

## 📡 Principais Endpoints

### Autenticação
- `POST /api/auth/login` - Login

### Usuários (admin)
- `GET /api/users` - Listar
- `POST /api/users` - Criar
- `PUT /api/users/:id` - Atualizar
- `DELETE /api/users/:id` - Remover

### Produtos
- `GET /api/products` - Listar
- `POST /api/products` - Criar (fornecedor/admin)
- `PUT /api/products/:id` - Atualizar
- `DELETE /api/products/:id` - Remover

### Campanhas
- `GET /api/campaigns` - Listar
- `POST /api/campaigns` - Criar (fornecedor/admin)
- `GET /api/campaigns/:id/meta` - Verificar meta

### Pedidos
- `POST /api/orders` - Criar pedido (loja)
- `GET /api/orders` - Listar (filtrado por perfil)
- `PATCH /api/orders/:id/status` - Atualizar status (fornecedor/admin)

### Cashback
- `GET /api/cashback` - Histórico
- `PATCH /api/cashback/:id/confirm` - Confirmar (admin)

### Saques
- `POST /api/withdrawals` - Solicitar saque (loja)
- `PATCH /api/withdrawals/:id/status` - Aprovar/negar (admin)

### Arquivos
- `POST /api/files` - Upload (fornecedor)
- `GET /api/files/:id/download` - Download

## 🔄 Funcionalidades Automáticas

- **Aplicação de condições regionais**: Ao criar pedido, sistema aplica automaticamente condições do fornecedor baseado no estado da loja
- **Cálculo de cashback**: Calculado automaticamente no momento do pedido
- **Validação de meta de campanha**: Endpoint para verificar se campanha com meta geral atingiu objetivo
- **Envio de e-mails automáticos**: Ao criar pedido, e-mails são enviados automaticamente para:
  - **Lojista**: Confirmação do pedido realizado
  - **Fornecedor**: Notificação de novo pedido recebido
  - **Central/Admin**: Auditoria e acompanhamento

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento (hot reload)
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia versão compilada (produção)

## 📝 Notas

- O banco de dados usa TypeORM com `synchronize: false` (use migrations em produção)
- Uploads são salvos em `backend/uploads/`
- Documentação completa disponível em `/docs` (Swagger UI)

## 🐛 Troubleshooting

**Erro de conexão com banco:**
- Verifique se PostgreSQL está rodando
- Confirme credenciais no `.env`

**Erro de autenticação:**
- Verifique se `JWT_SECRET` está configurado
- Token expira em 12h

**Upload de arquivos falha:**
- Verifique se pasta `uploads/` existe e tem permissões de escrita

## 📄 Licença

Este projeto é proprietário.

