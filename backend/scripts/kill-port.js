const { execSync } = require('child_process');

const port = String(process.argv[2] || '5000').replace(/\D/g, '');
if (!port) process.exit(0);

function killWindows() {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const pids = new Set();
    for (const line of output.split('\n')) {
      if (!/LISTENING/i.test(line)) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[kill-port] Port ${port} libéré (PID ${pid})`);
      } catch {
        /* ignore */
      }
    }
    if (!pids.size) {
      console.log(`[kill-port] Aucun processus sur le port ${port}`);
    }
  } catch {
    console.log(`[kill-port] Aucun processus sur le port ${port}`);
  }
}

function killUnix() {
  try {
    execSync(`lsof -ti:${port} | xargs -r kill -9`, { shell: true, stdio: 'ignore' });
    console.log(`[kill-port] Port ${port} libéré`);
  } catch {
    console.log(`[kill-port] Aucun processus sur le port ${port}`);
  }
}

if (process.platform === 'win32') killWindows();
else killUnix();
