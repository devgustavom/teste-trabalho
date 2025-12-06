/**
 * Script para criar arquivo .env automaticamente
 * Execute: node scripts/create-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

// Gerar JWT_SECRET aleatório
const jwtSecret = crypto.randomBytes(32).toString('hex');

const envContent = `# ============================================
# CENTRAL DE COMPRAS - CONFIGURAÇÃO
# Gerado automaticamente em ${new Date().toISOString()}
# ============================================

# Porta do servidor
PORT=3333

# Configuração do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=central_de_compras

# JWT Secret (gerado automaticamente)
JWT_SECRET=${jwtSecret}

# Configuração de Email (opcional - para envio de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
SMTP_FROM=noreply@centraldecompras.com
`;

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env já existe!');
    console.log('   Se quiser recriar, delete o arquivo .env primeiro.');
    
    // Verificar se JWT_SECRET está configurado
    const existingEnv = fs.readFileSync(envPath, 'utf8');
    if (!existingEnv.includes('JWT_SECRET=') || existingEnv.match(/JWT_SECRET=\s*$/)) {
      console.log('\n⚠️  JWT_SECRET não está configurado no .env existente!');
      console.log('   Adicionando JWT_SECRET...');
      
      // Adicionar JWT_SECRET se não existir
      if (!existingEnv.includes('JWT_SECRET=')) {
        const updatedEnv = existingEnv + `\n# JWT Secret\nJWT_SECRET=${jwtSecret}\n`;
        fs.writeFileSync(envPath, updatedEnv);
        console.log('✅ JWT_SECRET adicionado ao .env');
      } else {
        // Substituir JWT_SECRET vazio
        const updatedEnv = existingEnv.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`);
        fs.writeFileSync(envPath, updatedEnv);
        console.log('✅ JWT_SECRET atualizado no .env');
      }
    } else {
      console.log('✅ JWT_SECRET já está configurado');
    }
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado com sucesso!');
    console.log(`✅ JWT_SECRET gerado: ${jwtSecret.substring(0, 20)}...`);
  }
  
  console.log('\n📝 IMPORTANTE:');
  console.log('   - Revise o arquivo .env e ajuste as configurações do banco de dados');
  console.log('   - Em produção, use um JWT_SECRET mais seguro');
  console.log('   - Não compartilhe o arquivo .env publicamente\n');
} catch (error) {
  console.error('❌ Erro ao criar .env:', error.message);
  process.exit(1);
}

