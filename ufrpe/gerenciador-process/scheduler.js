class Processo {
  constructor(id, nome, prioridade, tipo, tempoTotal) {
    this.id = id;
    this.nome = nome;
    this.prioridade = prioridade;
    this.tipo = tipo;
    this.tempoTotal = tempoTotal;
    this.tempoRestante = tempoTotal;
    this.tempoEspera = 0;
    this.tempoTurnaround = 0;
  }
}

class Scheduler {
  constructor(quantum, algoritmo) {
    this.quantum = quantum;
    this.algoritmo = algoritmo;
    this.filaProntos = [];
    this.tempoAtual = 0;
    this.finalizados = [];
  }

  adicionarProcesso(p) {
    this.filaProntos.push(p);
    console.log(`Processo ${p.nome} entrou na fila de prontos`);
  }

  ordenarFila() {
    if (this.algoritmo === "PRIORIDADE") {
      this.filaProntos.sort((a, b) => a.prioridade - b.prioridade);
    }
  }

  executar() {
    console.log(`\n--- Iniciando Escalonamento (${this.algoritmo}) ---`);

    while (this.filaProntos.length > 0) {
      this.ordenarFila();
      const processo = this.filaProntos.shift();

      const tempoExec = Math.min(this.quantum, processo.tempoRestante);

      console.log(`\n[CPU] Executando ${processo.nome} por ${tempoExec} ms`);

      processo.tempoRestante -= tempoExec;
      this.tempoAtual += tempoExec;

      // Atualiza tempo de espera dos outros
      this.filaProntos.forEach((p) => (p.tempoEspera += tempoExec));

      if (processo.tempoRestante > 0) {
        console.log(`[PREEMPÇÃO] ${processo.nome} voltou para fila`);
        this.filaProntos.push(processo);
      } else {
        processo.tempoTurnaround = this.tempoAtual;
        console.log(`[FINALIZADO] ${processo.nome}`);
        this.finalizados.push(processo);
      }

      this.mostrarFila();
    }

    this.mostrarResultados();
  }

  mostrarFila() {
    console.log(
      "Fila de prontos:",
      this.filaProntos.map((p) => p.nome).join(", ")
    );
  }

  mostrarResultados() {
    console.log("\n--- RESULTADOS ---");
    let somaEspera = 0;

    this.finalizados.forEach((p) => {
      console.log(
        `${p.nome} | Turnaround: ${p.tempoTurnaround} | Espera: ${p.tempoEspera}`
      );
      somaEspera += p.tempoEspera;
    });

    console.log(
      `Tempo médio de espera: ${somaEspera / this.finalizados.length}`
    );
  }
}

// ====== SIMULAÇÃO ======
const scheduler = new Scheduler(3, "ROUND_ROBIN");
// Troque para "PRIORIDADE"

scheduler.adicionarProcesso(new Processo(1, "P1", 2, "CPU", 10));
scheduler.adicionarProcesso(new Processo(2, "P2", 1, "IO", 6));
scheduler.adicionarProcesso(new Processo(3, "P3", 3, "CPU", 8));
scheduler.adicionarProcesso(new Processo(4, "P4", 2, "CPU", 5));

scheduler.executar();
