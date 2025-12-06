## 🔧 Solução: Fornecedor Não Encontrado ao Login

Se você receber a mensagem **"Fornecedor não encontrado. Faça login novamente."** ao tentar criar um produto, siga estes passos:

### **Passo 1: Verificar o Banco de Dados**

Execute o script SQL para debugar:
```bash
psql -U postgres -d central_compras -f database/debug-suppliers.sql
```

Isso vai mostrar:
- Lista de usuários com role "supplier"
- Lista de fornecedores e seus user_id
- Se há fornecedores com user_id NULL
- Relações entre users e suppliers

### **Passo 2: Analisar os Resultados**

**Cenário A: Usuário existe mas não tem fornecedor**
```
Se você vir um usuário supplier sem fornecedor relacionado, execute:
```sql
INSERT INTO suppliers (user_id, legal_name, trade_name, state, category, created_at, updated_at)
VALUES (ID_DO_USUARIO, 'Nome da Empresa', 'Nome da Empresa', 'SP', 'Geral', NOW(), NOW());
```

**Cenário B: Fornecedor existe mas user_id é NULL**
```sql
UPDATE suppliers SET user_id = ID_DO_USUARIO WHERE id = ID_DO_FORNECEDOR;
```

### **Passo 3: Testar Novamente**

1. Faça logout completamente
   - Limpe o localStorage ou feche e abra o navegador
   - Ou execute no console do navegador:
   ```javascript
   localStorage.clear();
   ```

2. Faça login novamente

3. Verifique se o `supplier_id` está sendo retornado:
   - Abra as Developer Tools (F12)
   - Vá para Application → Local Storage
   - Procure por "user"
   - Veja se tem `supplier_id` no JSON

### **Passo 4: Criar Produto**

Se o `supplier_id` está aparecer no localStorage, tente criar um produto novamente.

### **Logs para Debugging**

Se o problema continuar, verifique os logs do backend:
- Procure por linhas que começam com 🔍 ou ✅ ou ⚠️
- Elas mostram exatamente qual foi o problema

**Exemplo de log esperado:**
```
🔐 Login do usuário joao@fornecedor.com (role: supplier)
🔍 Procurando fornecedor para usuário ID 5
✅ Fornecedor encontrado: ID 3
```

**Exemplo de log com problema:**
```
🔐 Login do usuário joao@fornecedor.com (role: supplier)
🔍 Procurando fornecedor para usuário ID 5
⚠️ Nenhum fornecedor encontrado para user_id 5
📋 Total de fornecedores no banco: 2
```

Se ver isso último, é porque o usuário não tem fornecedor associado no banco. Execute o comando SQL do **Passo 2 - Cenário A**.

### **Solução Rápida: Recriar o Fornecedor**

Se nada funcionar:

1. No banco, delete o fornecedor problemático:
```sql
DELETE FROM suppliers WHERE id = ID_DO_FORNECEDOR;
```

2. Delete o usuário também:
```sql
DELETE FROM users WHERE id = ID_DO_USUARIO;
```

3. Crie um novo fornecedor através da interface do sistema

### **Contato**

Se o problema persistir, contate o administrador com os seguintes dados:
- Email usado no login
- Saída do script debug-suppliers.sql
- Logs do backend (veja acima)
