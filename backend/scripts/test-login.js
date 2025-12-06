const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function testLogin() {
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

    // Buscar os dois admins
    const result = await client.query(
      'SELECT id, name, email, password FROM users WHERE role = $1 ORDER BY id DESC',
      ['admin']
    );

    if (result.rows.length === 0) {
      console.log('❌ Nenhum admin encontrado');
      await client.end();
      return;
    }

    console.log('🔐 Testando login com senha "admin123"\n');

    for (const user of result.rows) {
      console.log(`\n👤 Admin: ${user.email} (ID: ${user.id})`);
      console.log(`   Hash armazenado: ${user.password.substring(0, 20)}...`);
      
      try {
        const isValid = await bcrypt.compare('admin123', user.password);
        if (isValid) {
          console.log(`   ✅ SENHA VÁLIDA - Use estas credenciais:`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Senha: admin123`);
        } else {
          console.log(`   ❌ SENHA INVÁLIDA para este admin`);
        }
      } catch (err) {
        console.log(`   ⚠️ Erro ao comparar: ${err.message}`);
      }
    }

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testLogin();
