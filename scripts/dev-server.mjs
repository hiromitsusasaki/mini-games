import { spawn } from 'node:child_process';

// Build once, then serve
const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
build.on('exit', (code) => {
  if (code !== 0) process.exit(code ?? 1);
  const server = spawn('python3', ['-m', 'http.server', '18080', '--bind', '127.0.0.1', '--directory', 'public'], {
    stdio: 'inherit'
  });
  server.on('exit', (c) => process.exit(c ?? 0));
});
