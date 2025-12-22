// Simulação de Mutex simples
class Mutex {
  constructor() {
    this.locked = false;
    this.queue = [];
  }

  lock(threadName) {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        console.log(`[MUTEX] ${threadName} obteve o lock`);
        resolve();
      } else {
        console.log(`[MUTEX] ${threadName} aguardando lock`);
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.locked = false;
    }
  }
}

// Recursos compartilhados
let bufferA = 0;
let bufferB = 0;

const mutexA = new Mutex();
const mutexB = new Mutex();

// Função que simula uma thread
async function thread(id) {
  const name = `Thread-${id}`;

  while (true) {
    // Acessando buffer A
    await mutexA.lock(name);
    console.log(`${name} acessando Buffer A`);
    bufferA++;
    console.log(`${name} Buffer A = ${bufferA}`);
    await sleep(3000);
    mutexA.unlock();

    // Acessando buffer B
    await mutexB.lock(name);
    console.log(`${name} acessando Buffer B`);
    bufferB++;
    console.log(`${name} Buffer B = ${bufferB}`);
    await sleep(3000);
    mutexB.unlock();
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Criando 5 threads
for (let i = 1; i <= 5; i++) {
  thread(i);
}
