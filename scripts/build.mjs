import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const repoRoot = process.cwd();
const gamesDir = path.join(repoRoot, 'games');
const outRoot = path.join(repoRoot, 'public');

fs.mkdirSync(outRoot, { recursive: true });

const games = fs
  .readdirSync(gamesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const manifest = [];

for (const name of games) {
  const gameRoot = path.join(gamesDir, name);
  const metaPath = path.join(gameRoot, 'game.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  const gameOut = path.join(outRoot, 'games', name);
  fs.mkdirSync(path.join(gameOut, 'dist'), { recursive: true });

  // copy html
  fs.copyFileSync(path.join(gameRoot, 'index.html'), path.join(gameOut, 'index.html'));

  // build ts -> js
  await build({
    entryPoints: [path.join(gameRoot, meta.entry)],
    outfile: path.join(gameOut, 'dist', 'main.js'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    sourcemap: true,
    minify: false
  });

  manifest.push({ name: meta.name, title: meta.title, path: `./games/${name}/index.html` });
}

fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>mini-games</title>
  <style>
    body { margin: 0; background: #0b0b10; color: #eaeaf2; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
    header { padding: 16px; border-bottom: 1px solid #26263a; }
    main { max-width: 900px; margin: 0 auto; padding: 16px; }
    a { color: #9db7ff; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .card { border: 1px solid #26263a; background: #111123; padding: 12px; border-radius: 10px; }
    .title { font-weight: 700; }
    .muted { opacity: 0.8; font-size: 12px; }
  </style>
</head>
<body>
  <header><strong>mini-games</strong> <span class="muted">(GitHub Pages)</span></header>
  <main>
    <p class="muted">Add a game: <code>npm run new -- --name my-game --title &quot;My Game&quot;</code></p>
    <div id="grid" class="grid"></div>
  </main>
  <script type="module">
    const res = await fetch('./manifest.json');
    const games = await res.json();
    const grid = document.getElementById('grid');

    function escapeHtml(s) {
      return String(s)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#39;');
    }

    for (const g of games) {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML =
        '<div class="title">' + escapeHtml(g.title) + '</div>' +
        '<div class="muted">/' + escapeHtml(g.name) + '</div>' +
        '<p><a href="' + g.path + '">Play →</a></p>';
      grid.appendChild(el);
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(outRoot, 'index.html'), indexHtml);
console.log(`Built ${manifest.length} games -> public/`);
