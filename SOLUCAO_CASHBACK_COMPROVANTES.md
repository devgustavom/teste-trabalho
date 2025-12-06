# ✅ SOLUÇÃO: Erro ao enviar comprovante de cashback

## 🐛 Problema Identificado

Ao tentar enviar comprovantes (DANFE, recibos, etc.) na seção "Meu Cashback", o sistema retornava erro **HTTP 500**.

## 🔍 Causa Raiz

A pasta `/uploads` não existia no servidor, impedindo que os arquivos fossem salvos no disco.

Quando o multer tentava fazer upload, ele recebia um erro ao tentar escrever na pasta inexistente, causando uma exceção não tratada que retornava HTTP 500.

---

## ✅ Solução Implementada

### 1. **Criação da Pasta `/uploads`**
- A pasta foi criada automaticamente via script
- Localização: `projeto-raiz/uploads/`
- Permissões: Escrita e leitura habilitadas

### 2. **Melhorias no `CashbackController`**

Adicionados logs detalhados para debugging:

```typescript
// Antes do upload
console.log(`📤 Upload de comprovante para cashback ID: ${id}`);

// Depois do upload
console.log(`✅ Arquivo recebido: ${req.file.filename}`);
console.log(`✅ Comprovante salvo: ${file_url}`);

// Em caso de erro
console.log(`❌ Erro ao fazer upload de comprovante: ${error}`);
```

### 3. **Validações Adicionadas**

✅ Verifica se cashback existe  
✅ Verifica permissões (lojista só vê seus próprios)  
✅ Valida se arquivo foi enviado  
✅ Valida tipos de arquivo (PDF, JPG, PNG)  
✅ Valida tamanho de arquivo  

---

## 📋 Como Usar

### Para enviar um comprovante:

1. **Faça login como lojista:**
   ```
   Email: gerente@loja.com
   Senha: lojista123
   ```

2. **Navegue para "Meu Cashback"**
   - Você verá seus cashbacks pendentes

3. **Clique em "Enviar Comprovante"**
   - Selecione um arquivo:
     - ✅ PDF (DANFE, recibo)
     - ✅ JPG/JPEG (foto do comprovante)
     - ✅ PNG (print da nota)
   - Arquivo máximo: 5MB

4. **Confirme o envio**
   - Arquivo será salvo em `/uploads/`
   - URL será registrada no banco
   - Admin poderá fazer download e validar

---

## 📊 Cashbacks Disponíveis para Teste

Após o reset, temos 2 cashbacks prontos:

| ID | Loja | Valor | Status | Pedido |
|----|------|-------|--------|--------|
| 1 | Loja Centro | R$ 450.00 | Pendente | #2 |
| 2 | Loja Centro | R$ 270.00 | Pendente | #3 |

---

## 🔧 Logs do Backend

Quando você enviar um comprovante, verá logs como:

```
📤 Upload de comprovante para cashback ID: 1
✅ Arquivo recebido: cashback-proof-1234567890-comprovante.pdf
✅ Comprovante salvo: /uploads/cashback-proof-1234567890-comprovante.pdf
```

Se houver erro:
```
❌ Erro ao fazer upload de comprovante: ENOENT: no such file or directory
```

---

## 🎯 Fluxo Completo

1. **Lojista** faz login
2. **Lojista** vê seus cashbacks em "Meu Cashback"
3. **Lojista** clica em "Enviar Comprovante"
4. **Lojista** seleciona e envia um arquivo
5. **Admin** vê na dashboard que há comprovante pendente
6. **Admin** faz download e valida
7. **Admin** confirma o cashback
8. **Lojista** pode sacar o cashback confirmado via PIX

---

## 📁 Estrutura de Arquivos

```
projeto-raiz/
├── uploads/                    ✅ Pasta criada
│   ├── cashback-proof-123.pdf
│   ├── cashback-proof-456.jpg
│   └── ...
├── backend/
│   └── scripts/
│       └── fix-uploads.js      ✅ Script que cria a pasta
└── ...
```

---

## ✅ Verificação

Para confirmar que tudo está funcionando:

```bash
# Verificar se pasta existe
node backend/scripts/fix-uploads.js

# Verificar cashbacks no banco
node backend/scripts/check-cashbacks.js
```

---

## 🚀 Status

✅ **Problema resolvido!**
- Pasta `/uploads` criada
- CashbackController com melhor tratamento de erros
- Logs detalhados para debugging
- Validações implementadas

Agora você pode enviar comprovantes sem problemas! 📤
