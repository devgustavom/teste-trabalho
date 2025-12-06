const bcrypt = require('bcryptjs');

// Gerar hash da senha
async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 8);
  console.log('Hash bcrypt da senha "admin123":');
  console.log(hash);
  console.log('\n✅ Use este hash para inserir no banco de dados:');
  console.log(`
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
  'Administrador 2',
  'admin2@central.com',
  '${hash}',
  'admin',
  NOW(),
  NOW()
);
  `);
}

generateHash();
