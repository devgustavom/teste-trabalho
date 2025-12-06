import crypto from "crypto";

/**
 * Gera um username automático baseado no nome/CNPJ
 */
export function generateUsername(name: string, cnpj?: string): string {
  // Remove acentos e caracteres especiais
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);

  // Se tiver CNPJ, usa os últimos 4 dígitos
  if (cnpj) {
    const cnpjDigits = cnpj.replace(/\D/g, "").slice(-4);
    return `${normalized}${cnpjDigits}`;
  }

  // Adiciona número aleatório para garantir unicidade
  const random = crypto.randomInt(1000, 9999);
  return `${normalized}${random}`;
}

/**
 * Gera uma senha aleatória segura
 */
export function generatePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*";
  const all = uppercase + lowercase + numbers + special;

  let password = "";
  
  // Garante pelo menos um de cada tipo
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];

  // Preenche o resto
  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(0, all.length)];
  }

  // Embaralha a senha
  return password
    .split("")
    .sort(() => crypto.randomInt(-1, 2))
    .join("");
}

/**
 * Gera email baseado no nome/CNPJ
 */
export function generateEmail(name: string, cnpj?: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 30);

  if (cnpj) {
    const cnpjDigits = cnpj.replace(/\D/g, "").slice(-4);
    return `${normalized}${cnpjDigits}@centraldecompras.com`;
  }

  const random = crypto.randomInt(1000, 9999);
  return `${normalized}${random}@centraldecompras.com`;
}

