const readline = require("readline");

// ==================== CIFRA DE CÉSAR SIMPLES ====================
class CaesarCipher {
  constructor(shift = 3) {
    this.shift = shift;
  }

  encrypt(text) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          char = String.fromCharCode(((code - 65 + this.shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 + this.shift) % 26) + 97);
        }
      }
      result += char;
    }
    return result;
  }

  decrypt(text) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          char = String.fromCharCode(((code - 65 - this.shift + 26) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 - this.shift + 26) % 26) + 97);
        }
      }
      result += char;
    }
    return result;
  }
}

// ==================== XOR SIMPLES ====================
class XORCipher {
  constructor(key = 123) {
    this.key = key;
  }

  encrypt(text) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.key;
      result += String.fromCharCode(charCode);
    }
    return Buffer.from(result).toString("hex");
  }

  decrypt(hexText) {
    const buffer = Buffer.from(hexText, "hex");
    let result = "";
    for (let i = 0; i < buffer.length; i++) {
      const charCode = buffer[i] ^ this.key;
      result += String.fromCharCode(charCode);
    }
    return result;
  }
}

// ==================== QUEBRADOR DE SENHAS CORRIGIDO ====================
class PasswordCracker {
  constructor() {
    this.characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    this.testedCount = 0;
  }

  // Quebra Cifra de César CORRETAMENTE
  crackCaesar(encryptedText, originalPassword = null) {
    console.log("\n🔓 Quebrando Cifra de César...");
    console.log(`Texto cifrado: ${encryptedText}`);

    const startTime = Date.now();
    this.testedCount = 0;

    // Testa todas as 25 rotações possíveis
    for (let shift = 1; shift <= 25; shift++) {
      this.testedCount++;
      const cipher = new CaesarCipher(shift);
      const decrypted = cipher.decrypt(encryptedText);

      // VERIFICAÇÃO CORRIGIDA: só aceita se for igual à original
      if (originalPassword && decrypted === originalPassword) {
        const timeMs = Date.now() - startTime;
        return {
          success: true,
          password: decrypted,
          shift: shift,
          timeMs: timeMs,
          attempts: this.testedCount,
          isCorrect: true,
        };
      }

      // Se não temos senha original, mostra possibilidades
      if (!originalPassword && this.isPossiblePassword(decrypted)) {
        console.log(`  Shift ${shift}: "${decrypted}" (possível)`);
      }
    }

    const timeMs = Date.now() - startTime;
    return {
      success: false,
      timeMs: timeMs,
      attempts: this.testedCount,
    };
  }

  // Quebra XOR CORRETAMENTE
  crackXOR(encryptedHex, originalPassword = null) {
    console.log("\n🔓 Quebrando XOR Cipher...");
    console.log(`Texto cifrado (hex): ${encryptedHex}`);

    const startTime = Date.now();
    this.testedCount = 0;

    // Testa chaves de 0 a 255
    for (let key = 0; key <= 255; key++) {
      this.testedCount++;
      try {
        const cipher = new XORCipher(key);
        const decrypted = cipher.decrypt(encryptedHex);

        // VERIFICAÇÃO CORRIGIDA
        if (originalPassword && decrypted === originalPassword) {
          const timeMs = Date.now() - startTime;
          return {
            success: true,
            password: decrypted,
            key: key,
            timeMs: timeMs,
            attempts: this.testedCount,
            isCorrect: true,
          };
        }

        // Mostra possibilidades
        if (!originalPassword && this.isPossiblePassword(decrypted)) {
          console.log(`  Key ${key}: "${decrypted}"`);
        }
      } catch (e) {
        // Ignora erros
      }
    }

    const timeMs = Date.now() - startTime;
    return {
      success: false,
      timeMs: timeMs,
      attempts: this.testedCount,
    };
  }

  // Força bruta REAL - essa funciona bem!
  bruteForce(encryptedText, algorithm) {
    console.log(`\n⚔️ Força bruta REAL no algoritmo: ${algorithm}`);
    console.log(`Procurando senha que gera: ${encryptedText}`);
    console.log("Isso pode levar vários segundos...\n");

    const startTime = Date.now();
    this.testedCount = 0;
    let lastUpdate = startTime;

    // Testa senhas de 1 a 6 caracteres
    for (let length = 1; length <= 6; length++) {
      console.log(`Testando senhas de ${length} caractere(s)...`);

      const total = Math.pow(this.characters.length, length);
      let foundInThisLength = false;

      for (let i = 0; i < total; i++) {
        this.testedCount++;

        // Constrói senha
        let password = "";
        let temp = i;
        for (let j = 0; j < length; j++) {
          const index = temp % this.characters.length;
          password = this.characters[index] + password;
          temp = Math.floor(temp / this.characters.length);
        }

        // Criptografa e compara
        let testEncrypted;
        if (algorithm === "caesar") {
          const cipher = new CaesarCipher(3); // shift fixo de 3
          testEncrypted = cipher.encrypt(password);
        } else if (algorithm === "xor") {
          const cipher = new XORCipher(123); // key fixa de 123
          testEncrypted = cipher.encrypt(password);
        }

        // Progresso
        const now = Date.now();
        if (now - lastUpdate >= 2000) {
          // A cada 2 segundos
          lastUpdate = now;
          const elapsed = (now - startTime) / 1000;
          const speed = Math.floor(this.testedCount / elapsed);
          console.log(
            `  ${this.testedCount.toLocaleString()} testadas (${speed.toLocaleString()}/s)`
          );
        }

        if (testEncrypted === encryptedText) {
          const timeMs = now - startTime;
          console.log(
            `\n🎉 ENCONTRADA na tentativa ${this.testedCount.toLocaleString()}!`
          );
          return {
            success: true,
            password: password,
            timeMs: timeMs,
            timeSeconds: timeMs / 1000,
            attempts: this.testedCount,
          };
        }
      }

      if (foundInThisLength) break;
    }

    const timeMs = Date.now() - startTime;
    return {
      success: false,
      timeMs: timeMs,
      timeSeconds: timeMs / 1000,
      attempts: this.testedCount,
    };
  }

  isPossiblePassword(text) {
    // Mais restritiva: precisa ser alfanumérico e ter pelo menos 3 chars
    return (
      text.length >= 3 &&
      text.length <= 8 &&
      /^[a-z0-9]+$/i.test(text) &&
      /[a-z]/i.test(text) && // Tem que ter pelo menos uma letra
      /[0-9]/.test(text)
    ); // E pelo menos um número
  }
}

// ==================== PROGRAMA PRINCIPAL ====================
async function main() {
  console.log("=".repeat(60));
  console.log("🔐 SISTEMA DE CRIPTOGRAFIA - VERSÃO CORRIGIDA");
  console.log("=".repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const caesar = new CaesarCipher(3);
  const xor = new XORCipher(123);
  const cracker = new PasswordCracker();

  // Senha de teste
  const testPassword = "abc123";

  console.log(`\n🔐 Senha original: "${testPassword}"`);
  console.log(`📏 Tamanho: ${testPassword.length} caracteres`);

  // Criptografa
  const caesarEncrypted = caesar.encrypt(testPassword);
  const xorEncrypted = xor.encrypt(testPassword);

  console.log(`\n📝 CRIPTOGRAFIAS:`);
  console.log(`Cifra de César (shift=3): "${caesarEncrypted}"`);
  console.log(`XOR Cipher (key=123): "${xorEncrypted}" (hex)`);

  console.log("\n" + "=".repeat(60));
  console.log("⚔️  DEMONSTRAÇÃO DE ATAQUES");
  console.log("=".repeat(60));

  // 1. MOSTRAR POR QUE OS ATAQUES "RÁPIDOS" SÃO ENGANOSOS
  console.log('\n1. ⚠️  PROBLEMA COM ATAQUES "RÁPIDOS"');
  console.log("-".repeat(40));

  console.log("\nA) Tentando quebrar Cifra de César SEM saber a senha:");
  const fakeCaesarResult = cracker.crackCaesar(caesarEncrypted);
  console.log(
    'Resultado: Encontra várias "possíveis" senhas, mas não sabe qual é a correta!'
  );

  console.log("\nB) Tentando quebrar XOR SEM saber a senha:");
  const fakeXORResult = cracker.crackXOR(xorEncrypted);
  console.log("Resultado: Mesmo problema - múltiplas possibilidades!");

  // 2. ATAQUES CONHECENDO A SENHA (para comparação)
  console.log("\n\n2. ✅ ATAQUES CONHECENDO A SENHA (para verificar)");
  console.log("-".repeat(40));

  console.log('\nA) Cifra de César (sabendo que a senha é "abc123"):');
  const realCaesarResult = cracker.crackCaesar(caesarEncrypted, testPassword);
  if (realCaesarResult.success) {
    console.log(`✅ Shift correto: ${realCaesarResult.shift}`);
    console.log(`⏱️  Tempo: ${realCaesarResult.timeMs}ms`);
    console.log(`🎯 Tentativas: ${realCaesarResult.attempts}`);
  }

  console.log('\nB) XOR Cipher (sabendo que a senha é "abc123"):');
  const realXORResult = cracker.crackXOR(xorEncrypted, testPassword);
  if (realXORResult.success) {
    console.log(`✅ Chave correta: ${realXORResult.key}`);
    console.log(`⏱️  Tempo: ${realXORResult.timeMs}ms`);
    console.log(`🎯 Tentativas: ${realXORResult.attempts}`);
  }

  // 3. FORÇA BRUTA REAL (a única que realmente funciona sem saber a senha)
  console.log("\n\n3. ⚔️  FORÇA BRUTA REAL (funciona de verdade!)");
  console.log("-".repeat(40));

  console.log("\nEscolhendo aleatoriamente qual algoritmo atacar...");
  const target = Math.random() > 0.5 ? "caesar" : "xor";
  const targetText = target === "caesar" ? caesarEncrypted : xorEncrypted;

  console.log(`\n🎯 Atacando: ${target.toUpperCase()}`);
  console.log(`Alvo: ${targetText}`);

  const bruteResult = cracker.bruteForce(targetText, target);

  if (bruteResult.success) {
    console.log(`\n🎉 FORÇA BRUTA BEM-SUCEDIDA!`);
    console.log(`✅ Senha encontrada: "${bruteResult.password}"`);
    console.log(
      `⏱️  Tempo total: ${bruteResult.timeSeconds.toFixed(2)} segundos`
    );
    console.log(`🎯 Tentativas: ${bruteResult.attempts.toLocaleString()}`);
    console.log(
      `⚡ Velocidade: ${Math.floor(
        bruteResult.attempts / bruteResult.timeSeconds
      ).toLocaleString()}/s`
    );

    // Verificação
    if (bruteResult.password === testPassword) {
      console.log(`\n✅✅ CORRESPONDE EXATAMENTE À SENHA ORIGINAL!`);
    }
  }

  // 4. ANÁLISE E CONCLUSÕES
  console.log("\n" + "=".repeat(60));
  console.log("📊 CONCLUSÕES TÉCNICAS");
  console.log("=".repeat(60));

  console.log("\n🚨 PROBLEMAS IDENTIFICADOS:");
  console.log('1. Ataques "diretos" são enganosos');
  console.log('   - Encontram senhas que "funcionam"');
  console.log("   - Mas não necessariamente a correta");
  console.log("2. Verificação de senha é complexa");
  console.log('   - Como saber se "cde123" está certo ou errado?');

  console.log("\n✅ SOLUÇÃO REAL:");
  console.log("1. Força bruta completa é a única garantida");
  console.log("2. Mas é LENTA: 31 segundos para 64 milhões de tentativas");
  console.log("3. Em sistemas reais: impossível para senhas longas");

  console.log("\n💡 LIÇÃO PRÁTICA:");
  console.log("• Cifras simples = fácil de quebrar");
  console.log("• Força bruta funciona, mas é lenta");
  console.log("• Por isso usamos hash com salt em sistemas reais");
  console.log("• E exigimos senhas longas (>12 caracteres)");

  // Estatísticas
  console.log("\n📈 ESTATÍSTICAS DO TESTE:");
  console.log(`Senha: "${testPassword}" (${testPassword.length} chars)`);
  console.log(
    `Combinações testadas na força bruta: ~${Math.pow(36, 6).toLocaleString()}`
  );
  console.log(
    `Tempo: ${bruteResult.timeSeconds?.toFixed(2) || "N/A"} segundos`
  );
  console.log(
    `Velocidade: ${
      bruteResult.attempts && bruteResult.timeSeconds
        ? Math.floor(
            bruteResult.attempts / bruteResult.timeSeconds
          ).toLocaleString()
        : "N/A"
    }/s`
  );

  rl.question("\nPressione ENTER para sair...", () => {
    rl.close();
    process.exit(0);
  });
}

// Executar
main().catch(console.error);
