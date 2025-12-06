# Correção: Erro de Email e Exclusão de Lojas

## Problemas Identificados

1. **Erro de Email (ECONNREFUSED 127.0.0.1:587)**
   - O sistema tentava enviar emails mesmo sem SMTP configurado
   - Isso gerava erros que apareciam no console, mas não deveriam impedir a criação de lojas

2. **Exclusão de Lojas Não Funcionava**
   - O método de exclusão precisava de melhorias no tratamento de erros
   - Faltava validação adequada do ID

## Correções Realizadas

### 1. EmailService.ts - Email Opcional

**Mudanças:**
- ✅ Verifica se SMTP está configurado antes de tentar enviar emails
- ✅ Se SMTP não estiver configurado, apenas loga um aviso e continua
- ✅ Mostra as credenciais no console quando SMTP não está disponível
- ✅ Não lança erros que possam interromper o fluxo

**Comportamento:**
- Se `SMTP_HOST`, `SMTP_USER` ou `SMTP_PASS` não estiverem configurados:
  - Loga um aviso: `⚠️ SMTP não configurado. E-mails não serão enviados.`
  - Para credenciais: mostra no console: `📋 Credenciais geradas: Email: ..., Senha: ...`
  - Continua o processo normalmente

### 2. StoreController.ts - Melhorias na Exclusão

**Mudanças:**
- ✅ Validação do ID antes de processar
- ✅ Melhor tratamento de erros com mensagens específicas
- ✅ Uso de `ON DELETE CASCADE` do schema (já configurado)
- ✅ Mensagens de erro mais claras

**Comportamento:**
- Valida se o ID é válido
- Verifica se a loja existe
- Verifica permissões (apenas admin)
- Remove a loja (cascata automática para orders, cashback_entries, withdrawals)
- Retorna erro específico se houver constraint de foreign key

## Como Funciona Agora

### Criação de Loja
1. Cria o usuário (se não fornecido)
2. Cria a loja
3. Tenta enviar email (se SMTP configurado)
4. Se SMTP não configurado, mostra credenciais no console
5. Retorna sucesso com credenciais

### Exclusão de Loja
1. Valida o ID
2. Verifica se a loja existe
3. Verifica permissões (admin)
4. Remove a loja (cascata automática)
5. Retorna sucesso (204) ou erro específico

## Configuração de SMTP (Opcional)

Para habilitar o envio de emails, adicione no `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=seu-email@gmail.com
```

**Nota:** Sem SMTP configurado, o sistema funciona normalmente, apenas não envia emails. As credenciais são mostradas no console do servidor.

## Teste

1. **Criar Loja:**
   - Deve funcionar mesmo sem SMTP
   - Verifique o console para ver as credenciais se SMTP não estiver configurado

2. **Excluir Loja:**
   - Deve funcionar corretamente
   - Se houver erro, a mensagem será clara sobre o problema

## Próximos Passos

1. Reinicie o servidor backend
2. Teste criar uma loja (deve funcionar sem erros de email)
3. Teste excluir uma loja (deve funcionar corretamente)
4. Se quiser emails funcionando, configure SMTP no `.env`

