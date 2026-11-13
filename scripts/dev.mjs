import { spawn } from 'child_process';

console.log('\x1b[36m%s\x1b[0m', '⚡ Starting Portfolio with Neon Database Backend...');

// 1. Start Neon Express backend server
const server = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['tsx', 'server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' }
});

// 2. Start Vite dev frontend
const vite = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down dev servers...');
  server.kill();
  vite.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
