# 🔧 Correção: Connection "default" was not found

## Problema
Erro ao criar loja/fornecedor: `Connection "default" was not found`

## Causa
Os controllers estavam usando `getRepository()` que está **deprecated** no TypeORM 0.3. O TypeORM 0.3 usa `DataSource` em vez de `Connection`.

## Correções Aplicadas

### ✅ StoreController
- Substituído `getRepository(Store)` por `AppDataSource.getRepository(Store)`
- Substituído `getRepository(User)` por `AppDataSource.getRepository(User)`
- Adicionado tratamento de erros melhorado
- Corrigido role de 'store' para 'retailer' (consistente com o sistema)

### ✅ SupplierController
- Substituído `getRepository(Supplier)` por `AppDataSource.getRepository(Supplier)`
- Substituído `getRepository(User)` por `AppDataSource.getRepository(User)`
- Adicionado tratamento de erros melhorado

## Controllers Já Corrigidos
- ✅ AuthController
- ✅ UserController
- ✅ ReportController
- ✅ StoreController
- ✅ SupplierController

## Controllers que Ainda Precisam de Correção
- ⚠️ OrderController
- ⚠️ ProductController
- ⚠️ CampaignController
- ⚠️ CashbackController
- ⚠️ CategoryController
- ⚠️ FileController
- ⚠️ StateConditionController
- ⚠️ WithdrawalController

## Como Testar

1. **Reinicie o servidor backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Teste criar uma loja:**
   - Acesse a página de Lojas
   - Clique em "Nova Loja"
   - Preencha os dados obrigatórios (Nome e Estado)
   - Clique em "Criar Loja"

3. **Verifique se funcionou:**
   - A loja deve ser criada
   - Credenciais devem ser geradas automaticamente
   - Não deve aparecer erro de "Connection not found"

## Se Ainda Der Erro

1. Verifique se o servidor foi reiniciado após as mudanças
2. Verifique os logs do servidor para ver o erro completo
3. Verifique se o banco de dados está acessível
4. Verifique se o AppDataSource foi inicializado (deve aparecer "🟢 DB conectado")

