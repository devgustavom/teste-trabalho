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
    console.log('✅ Conectado ao banco de dados');

    const email = 'admin2@central.com';
    const name = 'Administrador 2';
    const password = '$2b$08$.tg/iry.MOourSumiNOrVeHpGsrQMcAdmyDAszZIQ6.zK5yAjCJga';
    const role = 'admin';

    // Verificar se já existe
    const checkResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log(`❌ Usuário com email ${email} já existe!`);
      console.log('ID:', checkResult.rows[0].id);
      await client.end();
      process.exit(0);
    }

    // Inserir novo admin
    const insertResult = await client.query(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, name, email, role',
      [name, email, password, role]
    );

    const newAdmin = insertResult.rows[0];
    
    console.log('✅ Novo admin criado com sucesso!');
    console.log(`
📋 Credenciais do novo admin:
   ID: ${newAdmin.id}
   Nome: ${newAdmin.name}
   Email: ${newAdmin.email}
   Senha: admin123
   Perfil: ${newAdmin.role}

🚀 Você já pode fazer login com essas credenciais!
    `);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar novo admin:', error.message);
    process.exit(1);
  }
}

createNewAdmin();
