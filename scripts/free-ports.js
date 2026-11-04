#!/usr/bin/env node
/**
 * Frees the dev ports (default: 5000 and 5173) from stale Node processes
 * left behind by a previous crashed/closed `npm run dev`.
 *
 * Only kills processes whose image is a Node executable, so unrelated
 * software on those ports is reported but never terminated.
 *
 * Usage: node scripts/free-ports.js [--dry-run] [port ...]
 */
const { execSync } = require('child_process');

const isWindows = process.platform === 'win32';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const ports = args.filter((a) => /^\d+$/.test(a)).map(Number);
if (ports.length === 0) ports.push(5000, 5173);

const run = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};

const findPids = (port) => {
  if (isWindows) {
    // No -p filter: Vite listens on IPv6 (::1), which `-p tcp` would hide.
    const out = run('netstat -ano');
    return [
      ...new Set(
        out
          .split(/\r?\n/)
          .filter((line) => line.includes('LISTENING'))
          .filter((line) => new RegExp(`[:.]${port}\\s`).test(line))
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && pid !== '0')
      ),
    ];
  }
  return [...new Set(run(`lsof -ti tcp:${port}`).split(/\s+/).filter(Boolean))];
};

const isNodeProcess = (pid) => {
  if (isWindows) {
    const out = run(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
    return /node\.exe/i.test(out);
  }
  return /node/i.test(run(`ps -p ${pid} -o comm=`));
};

let killedAny = false;

for (const port of ports) {
  const pids = findPids(port);
  if (pids.length === 0) {
    console.log(`Port ${port}: free`);
    continue;
  }

  for (const pid of pids) {
    if (!isNodeProcess(pid)) {
      console.warn(`Port ${port}: held by non-Node process ${pid} - leaving it alone.`);
      continue;
    }

    if (dryRun) {
      console.log(`Port ${port}: would stop stale Node process ${pid}`);
      killedAny = true;
      continue;
    }

    try {
      if (isWindows) {
        run(`taskkill /PID ${pid} /T /F`);
      } else {
        run(`kill -9 ${pid}`);
      }
      console.log(`Port ${port}: stopped stale Node process ${pid}`);
      killedAny = true;
    } catch (err) {
      console.warn(`Port ${port}: could not stop process ${pid} (${err.message})`);
    }
  }
}

if (killedAny && !dryRun) {
  // Give the OS a moment to release the sockets.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
}
