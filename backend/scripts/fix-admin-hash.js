const { Client } = require('pg');
require('dotenv').config();

async function fixAdminHash() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'central_compras',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco\n');

    const correctHash = '$2b$08$RgmTdY7F/ahw9w84fGzdKeERkAG.bXnIboc0fpv/CoQ84rt8U0TFe';

    // Atualizar o hash do admin
    const result = await client.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, password',
      [correctHash, 'admin@central.com']
    );

    if (result.rows.length > 0) {
      console.log('✅ Hash do admin atualizado com sucesso!\n');
      console.log('🔑 Credenciais para login:');
      console.log('   Email: admin@central.com');
      console.log('   Senha: admin123\n');
      console.log('🔐 Hash armazenado:', result.rows[0].password);
    } else {
      console.log('❌ Admin não encontrado');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

fixAdminHash();
