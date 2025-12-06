const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function testRepeatLogin() {
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

    const email = 'admin@central.com';
    const password = 'admin123';

    console.log(`🔐 Testando login repetido com: ${email}\n`);

    // Buscar usuário
    const userResult = await client.query(
      'SELECT id, name, email, password, role, last_login FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      await client.end();
      return;
    }

    const user = userResult.rows[0];
    console.log(`👤 Usuário encontrado: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🕐 Último login: ${user.last_login}\n`);

    // Testar senha
    console.log('🔐 Testando validação de senha...');
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      console.log('✅ SENHA VÁLIDA\n');
      
      // Simular update de last_login
      console.log('📝 Atualizando last_login...');
      const updateResult = await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1 RETURNING id, email, last_login',
        [user.id]
      );
      
      if (updateResult.rows.length > 0) {
        console.log(`✅ last_login atualizado para: ${updateResult.rows[0].last_login}\n`);
        
        // Buscar novamente para simular segundo login
        console.log('🔄 Simulando segundo login...');
        const secondLogin = await client.query(
          'SELECT id, name, email, password, role, last_login FROM users WHERE email = $1',
          [email]
        );
        
        const user2 = secondLogin.rows[0];
        console.log(`👤 Usuário encontrado novamente: ${user2.name}`);
        
        const isValid2 = await bcrypt.compare(password, user2.password);
        console.log(isValid2 ? '✅ SENHA VÁLIDA NO SEGUNDO LOGIN' : '❌ SENHA INVÁLIDA NO SEGUNDO LOGIN');
        
        if (!isValid2) {
          console.log('\n⚠️ PROBLEMA DETECTADO!');
          console.log(`Hash original:  ${user.password.substring(0, 30)}...`);
          console.log(`Hash recuperado: ${user2.password.substring(0, 30)}...`);
        }
      }
    } else {
      console.log('❌ SENHA INVÁLIDA');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testRepeatLogin();
