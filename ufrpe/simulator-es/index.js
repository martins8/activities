class DiskScheduler {
  constructor(minBlock, maxBlock) {
    this.minBlock = minBlock;
    this.maxBlock = maxBlock;
    this.currentPosition = minBlock;
  }

  calculateSeekTime(start, end) {
    return Math.abs(end - start);
  }

  scan(requests, initialDirection = "right") {
    if (requests.length === 0) {
      return { order: [], totalSeek: 0, partialSeeks: [] };
    }

    const sortedRequests = [...requests].sort((a, b) => a - b);
    const order = [];
    const partialSeeks = [];
    let totalSeek = 0;
    let current = this.currentPosition;

    const leftBlocks = sortedRequests.filter((r) => r < current);
    const rightBlocks = sortedRequests.filter((r) => r >= current);

    if (initialDirection === "right") {
      // Move para a direita primeiro
      for (const block of rightBlocks) {
        const seekTime = this.calculateSeekTime(current, block);
        totalSeek += seekTime;
        partialSeeks.push(seekTime);
        order.push(block);
        current = block;
      }

      // Se há blocos à esquerda, vai até o final direito e depois volta
      if (leftBlocks.length > 0) {
        // Vai até o bloco máximo
        const seekToMax = this.calculateSeekTime(current, this.maxBlock);
        totalSeek += seekToMax;
        partialSeeks.push(seekToMax);
        current = this.maxBlock;

        // Processa os blocos à esquerda em ordem decrescente
        for (let i = leftBlocks.length - 1; i >= 0; i--) {
          const block = leftBlocks[i];
          const seekTime = this.calculateSeekTime(current, block);
          totalSeek += seekTime;
          partialSeeks.push(seekTime);
          order.push(block);
          current = block;
        }
      }
    } else {
      // Move para a esquerda primeiro
      for (let i = leftBlocks.length - 1; i >= 0; i--) {
        const block = leftBlocks[i];
        const seekTime = this.calculateSeekTime(current, block);
        totalSeek += seekTime;
        partialSeeks.push(seekTime);
        order.push(block);
        current = block;
      }

      // Se há blocos à direita, vai até o final esquerdo e depois volta
      if (rightBlocks.length > 0) {
        // Vai até o bloco mínimo
        const seekToMin = this.calculateSeekTime(current, this.minBlock);
        totalSeek += seekToMin;
        partialSeeks.push(seekToMin);
        current = this.minBlock;

        // Processa os blocos à direita em ordem crescente
        for (const block of rightBlocks) {
          const seekTime = this.calculateSeekTime(current, block);
          totalSeek += seekTime;
          partialSeeks.push(seekTime);
          order.push(block);
          current = block;
        }
      }
    }

    return { order, totalSeek, partialSeeks };
  }

  cscan(requests, initialDirection = "right") {
    if (requests.length === 0) {
      return { order: [], totalSeek: 0, partialSeeks: [] };
    }

    const sortedRequests = [...requests].sort((a, b) => a - b);
    const order = [];
    const partialSeeks = [];
    let totalSeek = 0;
    let current = this.currentPosition;

    const leftBlocks = sortedRequests.filter((r) => r < current);
    const rightBlocks = sortedRequests.filter((r) => r >= current);

    if (initialDirection === "right") {
      // Move para a direita primeiro
      for (const block of rightBlocks) {
        const seekTime = this.calculateSeekTime(current, block);
        totalSeek += seekTime;
        partialSeeks.push(seekTime);
        order.push(block);
        current = block;
      }

      // Se há blocos à esquerda, vai até o final e volta ao início
      if (leftBlocks.length > 0) {
        // Vai até o bloco máximo
        const seekToMax = this.calculateSeekTime(current, this.maxBlock);
        totalSeek += seekToMax;
        partialSeeks.push(seekToMax);

        // Volta ao bloco mínimo (seek circular)
        const seekToMin = this.calculateSeekTime(this.maxBlock, this.minBlock);
        totalSeek += seekToMin;
        partialSeeks.push(seekToMin);

        current = this.minBlock;

        // Processa os blocos à esquerda em ordem crescente
        for (const block of leftBlocks) {
          const seekTime = this.calculateSeekTime(current, block);
          totalSeek += seekTime;
          partialSeeks.push(seekTime);
          order.push(block);
          current = block;
        }
      }
    } else {
      // Move para a esquerda primeiro
      for (let i = leftBlocks.length - 1; i >= 0; i--) {
        const block = leftBlocks[i];
        const seekTime = this.calculateSeekTime(current, block);
        totalSeek += seekTime;
        partialSeeks.push(seekTime);
        order.push(block);
        current = block;
      }

      // Se há blocos à direita, vai até o início e volta ao final
      if (rightBlocks.length > 0) {
        // Vai até o bloco mínimo
        const seekToMin = this.calculateSeekTime(current, this.minBlock);
        totalSeek += seekToMin;
        partialSeeks.push(seekToMin);

        // Volta ao bloco máximo (seek circular)
        const seekToMax = this.calculateSeekTime(this.minBlock, this.maxBlock);
        totalSeek += seekToMax;
        partialSeeks.push(seekToMax);

        current = this.maxBlock;

        // Processa os blocos à direita em ordem decrescente
        for (let i = rightBlocks.length - 1; i >= 0; i--) {
          const block = rightBlocks[i];
          const seekTime = this.calculateSeekTime(current, block);
          totalSeek += seekTime;
          partialSeeks.push(seekTime);
          order.push(block);
          current = block;
        }
      }
    }

    return { order, totalSeek, partialSeeks };
  }
}

class RAID0 {
  constructor(numDisks, blocksPerDisk) {
    this.numDisks = numDisks;
    this.blocksPerDisk = blocksPerDisk;
    this.disks = Array.from({ length: numDisks }, () =>
      Array.from({ length: blocksPerDisk }, () => null)
    );
  }

  writeData(dataBlocks) {
    console.log(`\n=== ALOCAÇÃO RAID 0 (Striping) ===`);
    console.log(
      `Escrevendo ${dataBlocks.length} blocos de dados em ${this.numDisks} discos`
    );

    dataBlocks.forEach((block, index) => {
      const diskIndex = index % this.numDisks;
      const blockIndex = Math.floor(index / this.numDisks);

      if (blockIndex < this.blocksPerDisk) {
        this.disks[diskIndex][blockIndex] = block;
        console.log(
          `Bloco ${block} → Disco ${diskIndex + 1}, Bloco ${blockIndex}`
        );
      }
    });

    this.displayRAIDLayout();
  }

  displayRAIDLayout() {
    console.log(`\n=== LAYOUT DOS DISCOS RAID 0 ===`);
    this.disks.forEach((disk, diskIndex) => {
      const occupiedBlocks = disk
        .map((block, index) => (block !== null ? `B${block}` : "Livre"))
        .join(" | ");
      console.log(`Disco ${diskIndex + 1}: [ ${occupiedBlocks} ]`);
    });
  }
}

// Função principal de simulação
function simulateDiskScheduling() {
  console.log("=== MINI SIMULADOR DE GERENCIAMENTO DE E/S ===\n");

  // Configuração do disco
  const minBlock = 0;
  const maxBlock = 199;
  console.log(`Configuração do disco:`);
  console.log(`- Bloco mínimo: ${minBlock}`);
  console.log(`- Bloco máximo: ${maxBlock}`);

  // Gerar requisições aleatórias
  const numRequests = 10;
  const requests = Array.from(
    { length: numRequests },
    () => Math.floor(Math.random() * (maxBlock - minBlock + 1)) + minBlock
  );

  console.log(`\nRequisições geradas aleatoriamente (${numRequests} blocos):`);
  console.log(requests.join(", "));

  const scheduler = new DiskScheduler(minBlock, maxBlock);

  // Executar SCAN
  console.log(`\n=== ALGORITMO SCAN (Elevador) ===`);
  const scanResult = scheduler.scan(requests, "right");
  console.log(`Ordem dos blocos visitados: ${scanResult.order.join(", ")}`);
  console.log(`Tempos de seek parciais: ${scanResult.partialSeeks.join(", ")}`);
  console.log(`Tempo total de seek: ${scanResult.totalSeek} unidades de tempo`);

  // Executar C-SCAN
  console.log(`\n=== ALGORITMO C-SCAN (Circular SCAN) ===`);
  const cscanResult = scheduler.cscan(requests, "right");
  console.log(`Ordem dos blocos visitados: ${cscanResult.order.join(", ")}`);
  console.log(
    `Tempos de seek parciais: ${cscanResult.partialSeeks.join(", ")}`
  );
  console.log(
    `Tempo total de seek: ${cscanResult.totalSeek} unidades de tempo`
  );

  // Simulação RAID 0
  console.log(`\n=== SIMULAÇÃO RAID 0 ===`);
  const raid0 = new RAID0(3, 8); // 3 discos, 8 blocos cada
  raid0.writeData(requests.slice(0, 12)); // Usa os primeiros 12 blocos das requisições

  // Comparação de eficiência
  console.log(`\n=== COMPARAÇÃO DOS ALGORITMOS ===`);
  console.log(`SCAN:  ${scanResult.totalSeek} unidades de tempo`);
  console.log(`C-SCAN: ${cscanResult.totalSeek} unidades de tempo`);

  const efficiencyDiff = scanResult.totalSeek - cscanResult.totalSeek;
  if (efficiencyDiff > 0) {
    console.log(`C-SCAN foi ${efficiencyDiff} unidades mais eficiente`);
  } else if (efficiencyDiff < 0) {
    console.log(`SCAN foi ${Math.abs(efficiencyDiff)} unidades mais eficiente`);
  } else {
    console.log(`Ambos os algoritmos tiveram a mesma eficiência`);
  }
}

// Função para simulação interativa
function interactiveSimulation() {
  console.log("=== MODO INTERATIVO ===");

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function askQuestion(question) {
    return new Promise((resolve) => {
      readline.question(question, resolve);
    });
  }

  async function start() {
    console.log("\nConfigurar simulador:");

    const minBlock = parseInt(
      (await askQuestion("Bloco mínimo (padrão 0): ")) || "0"
    );
    const maxBlock = parseInt(
      (await askQuestion("Bloco máximo (padrão 199): ")) || "199"
    );

    const requestType = await askQuestion(
      "Como definir requisições? (1) Aleatórias (2) Manuais: "
    );

    let requests = [];
    if (requestType === "2") {
      const manualRequests = await askQuestion(
        "Digite os blocos (separados por vírgula): "
      );
      requests = manualRequests.split(",").map((num) => parseInt(num.trim()));
    } else {
      const numRequests = parseInt(
        (await askQuestion("Número de requisições aleatórias (padrão 10): ")) ||
          "10"
      );
      requests = Array.from(
        { length: numRequests },
        () => Math.floor(Math.random() * (maxBlock - minBlock + 1)) + minBlock
      );
    }

    console.log(`\nRequisições: ${requests.join(", ")}`);

    const scheduler = new DiskScheduler(minBlock, maxBlock);

    // Executar ambos os algoritmos
    const scanResult = scheduler.scan([...requests], "right");
    const cscanResult = scheduler.cscan([...requests], "right");

    console.log(`\n=== RESULTADOS SCAN ===`);
    console.log(`Ordem: ${scanResult.order.join(", ")}`);
    console.log(`Seeks: ${scanResult.partialSeeks.join(", ")}`);
    console.log(`Total: ${scanResult.totalSeek} u.t.`);

    console.log(`\n=== RESULTADOS C-SCAN ===`);
    console.log(`Ordem: ${cscanResult.order.join(", ")}`);
    console.log(`Seeks: ${cscanResult.partialSeeks.join(", ")}`);
    console.log(`Total: ${cscanResult.totalSeek} u.t.`);

    // RAID Simulation
    const raid0 = new RAID0(3, Math.ceil(requests.length / 3) + 2);
    raid0.writeData(requests);

    readline.close();
  }

  start();
}

// Executar a simulação
if (require.main === module) {
  if (process.argv.includes("--interactive")) {
    interactiveSimulation();
  } else {
    simulateDiskScheduling();
  }
}

module.exports = { DiskScheduler, RAID0, simulateDiskScheduling };
