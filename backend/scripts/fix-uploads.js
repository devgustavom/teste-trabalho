const path = require('path');
const fs = require('fs');

console.log('🔍 VERIFICANDO ESTRUTURA DE UPLOADS\n');

// Verificar se pasta uploads existe
const uploadsPath = path.resolve(__dirname, '../../uploads');
console.log(`📁 Caminho esperado: ${uploadsPath}`);

if (fs.existsSync(uploadsPath)) {
  console.log('✅ Pasta /uploads existe');
  const files = fs.readdirSync(uploadsPath);
  console.log(`   Arquivos: ${files.length}`);
  if (files.length > 0) {
    files.slice(0, 5).forEach(f => console.log(`   - ${f}`));
  }
} else {
  console.log('❌ Pasta /uploads NÃO existe');
  console.log('\n📝 Criando pasta /uploads...');
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Pasta criada com sucesso!');
}

// Verificar permissões
try {
  const testFile = path.join(uploadsPath, 'test.txt');
  fs.writeFileSync(testFile, 'teste');
  fs.unlinkSync(testFile);
  console.log('✅ Pasta tem permissões de escrita');
} catch (err) {
  console.log('❌ Erro ao escrever na pasta:', err.message);
}

console.log('\n✅ Diagnóstico concluído!\n');
