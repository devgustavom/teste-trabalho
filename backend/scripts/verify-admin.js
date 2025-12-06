const { Client } = require('pg');
require('dotenv').config();

async function verifyAdmin() {
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

    // Listar todos os admins
    console.log('📋 Administradores no banco:\n');
    const result = await client.query(
      'SELECT id, name, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['admin']
    );

    if (result.rows.length === 0) {
      console.log('❌ Nenhum administrador encontrado no banco!');
    } else {
      result.rows.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`Nome: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Perfil: ${user.role}`);
        console.log(`Criado em: ${user.created_at}\n`);
      });
    }

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

verifyAdmin();
