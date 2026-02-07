type Particle = { x: number; y: number; vx: number; vy: number; life: number }

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) throw new Error('missing canvas');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('missing 2d context');

let particles: Particle[] = [];

function spawn(x: number, y: number): void {
  const next: Particle[] = [];
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 40 + Math.random() * 220;
    next.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.9 + Math.random() * 0.6
    });
  }
  particles = [...particles, ...next];
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  spawn(x, y);
});

let last = performance.now();
function tick(now: number): void {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  particles = particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vx: p.vx * Math.pow(0.02, dt),
      vy: (p.vy + 400 * dt) * Math.pow(0.03, dt),
      life: p.life - dt
    }))
    .filter((p) => p.life > 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0b0b10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    const t = Math.max(0, Math.min(1, p.life));
    const r = 1 + (1 - t) * 3;
    ctx.globalAlpha = t;
    ctx.fillStyle = '#9db7ff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
