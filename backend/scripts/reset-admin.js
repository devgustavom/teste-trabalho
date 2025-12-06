const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function createNewAdmin() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'central_compras',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // Gerar hash da senha
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 8);
    console.log(`🔒 Hash gerado: ${hashedPassword}\n`);

    // Deletar admins antigos para limpar
    await client.query('DELETE FROM users WHERE email IN ($1, $2)', 
      ['admin2@central.com', 'admin@central.com']);
    console.log('🗑️  Admins antigos removidos\n');

    // Inserir novo admin com hash correto
    const result = await client.query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, name, email, role`,
      ['Administrador', 'admin@central.com', hashedPassword, 'admin']
    );

    const newAdmin = result.rows[0];
    console.log('✅ Novo administrador criado com sucesso!\n');
    console.log(`📋 Dados do admin:`);
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Nome: ${newAdmin.name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Perfil: ${newAdmin.role}\n`);
    console.log(`🔑 Credenciais para login:`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Senha: ${password}\n`);

    // Verificar se funciona
    console.log('🔐 Testando a senha...');
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log(isValid ? '✅ Senha validada com sucesso!' : '❌ Erro na validação');

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createNewAdmin();
