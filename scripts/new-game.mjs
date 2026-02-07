import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const name = getArg('--name');
const title = getArg('--title') ?? name;

if (!name) {
  console.error('Usage: npm run new -- --name <kebab-case> [--title "My Game"]');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(name)) {
  console.error('name must be kebab-case: [a-z0-9-]+');
  process.exit(1);
}

const repoRoot = process.cwd();
const gameDir = path.join(repoRoot, 'games', name);

if (fs.existsSync(gameDir)) {
  console.error(`Game already exists: games/${name}`);
  process.exit(1);
}

fs.mkdirSync(path.join(gameDir, 'src'), { recursive: true });

fs.writeFileSync(
  path.join(gameDir, 'game.json'),
  JSON.stringify(
    {
      name,
      title,
      entry: 'src/main.ts'
    },
    null,
    2
  ) + '\n'
);

fs.writeFileSync(
  path.join(gameDir, 'index.html'),
  `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${escapeHtml(title ?? name)}</title>\n  <style>\n    body { margin: 0; background: #0b0b10; color: #eaeaf2; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }\n    header { padding: 12px 16px; border-bottom: 1px solid #26263a; display:flex; gap:12px; align-items:center;}\n    a { color: #9db7ff; }\n    canvas { display:block; margin: 16px auto; background: #111123; border: 1px solid #26263a; }\n    .hint { max-width: 900px; margin: 0 auto; padding: 0 16px 24px; opacity: 0.85; }\n  </style>\n</head>\n<body>\n  <header>\n    <a href="../../index.html">← back</a>\n    <strong>${escapeHtml(title ?? name)}</strong>\n  </header>\n  <canvas id="game" width="800" height="450"></canvas>\n  <div class="hint">\n    <p>Template game: click the canvas to spawn particles. Edit <code>src/main.ts</code>.</p>\n  </div>\n  <script type="module" src="./dist/main.js"></script>\n</body>\n</html>\n`
);

fs.writeFileSync(
  path.join(gameDir, 'src', 'main.ts'),
  `type Particle = { x: number; y: number; vx: number; vy: number; life: number }\n\nconst canvas = document.getElementById('game') as HTMLCanvasElement | null;\nif (!canvas) throw new Error('missing canvas');\nconst ctx = canvas.getContext('2d');\nif (!ctx) throw new Error('missing 2d context');\n\nlet particles: Particle[] = [];\n\nfunction spawn(x: number, y: number): void {\n  const next: Particle[] = [];\n  for (let i = 0; i < 80; i++) {\n    const a = Math.random() * Math.PI * 2;\n    const s = 40 + Math.random() * 220;\n    next.push({\n      x,\n      y,\n      vx: Math.cos(a) * s,\n      vy: Math.sin(a) * s,\n      life: 0.9 + Math.random() * 0.6\n    });\n  }\n  particles = [...particles, ...next];\n}\n\ncanvas.addEventListener('click', (e) => {\n  const rect = canvas.getBoundingClientRect();\n  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;\n  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;\n  spawn(x, y);\n});\n\nlet last = performance.now();\nfunction tick(now: number): void {\n  const dt = Math.min(0.033, (now - last) / 1000);\n  last = now;\n\n  particles = particles\n    .map((p) => ({\n      ...p,\n      x: p.x + p.vx * dt,\n      y: p.y + p.vy * dt,\n      vx: p.vx * Math.pow(0.02, dt),\n      vy: (p.vy + 400 * dt) * Math.pow(0.03, dt),\n      life: p.life - dt\n    }))\n    .filter((p) => p.life > 0);\n\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n\n  ctx.fillStyle = '#0b0b10';\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n  for (const p of particles) {\n    const t = Math.max(0, Math.min(1, p.life));\n    const r = 1 + (1 - t) * 3;\n    ctx.globalAlpha = t;\n    ctx.fillStyle = '#9db7ff';\n    ctx.beginPath();\n    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.globalAlpha = 1;\n\n  requestAnimationFrame(tick);\n}\n\nrequestAnimationFrame(tick);\n`
);

console.log(`Created games/${name}`);
console.log('Next: npm run build');

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
