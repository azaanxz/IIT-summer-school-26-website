/* ==============================================
   BIRTHDAY WEBSITE — script.js
   Features: confetti, countdown, floating emojis,
             party button, custom cursor, scroll FX
   ============================================== */

// ── Custom cursor ──────────────────────────────
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--cx', e.clientX + 'px');
  document.documentElement.style.setProperty('--cy', e.clientY + 'px');
});

// ── Floating emojis ────────────────────────────
const EMOJIS = ['🎉','🎊','🎈','🎁','🎂','✨','🌟','💫','⭐','🍰','🥳','🎶','🦄','🌈','💥'];
const emojiField = document.getElementById('emojiField');

function spawnEmoji() {
  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  el.style.left        = Math.random() * 100 + 'vw';
  el.style.animationDuration  = (5 + Math.random() * 8) + 's';
  el.style.animationDelay     = (Math.random() * 3) + 's';
  el.style.fontSize    = (1 + Math.random() * 1.8) + 'rem';
  emojiField.appendChild(el);
  // Remove after animation so DOM doesn't bloat
  setTimeout(() => el.remove(), 14000);
}
// Spawn a wave then keep spawning
for (let i = 0; i < 18; i++) setTimeout(spawnEmoji, i * 300);
setInterval(spawnEmoji, 800);

// ── Confetti engine ────────────────────────────
const canvas = document.getElementById('confettiCanvas');
const ctx    = canvas.getContext('2d');
let   pieces = [];
let   animId = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#ff4ecd','#ffe94e','#4ef0ff','#b14eff','#ff8c4e','#4effa0','#ffffff'];

class Piece {
  constructor(x, y, burst) {
    this.x    = x ?? Math.random() * canvas.width;
    this.y    = y ?? -20;
    this.vx   = (Math.random() - 0.5) * (burst ? 14 : 4);
    this.vy   = burst ? (Math.random() * -14 - 4) : (Math.random() * 3 + 1);
    this.size = Math.random() * 10 + 5;
    this.color= COLORS[Math.floor(Math.random() * COLORS.length)];
    this.rot  = Math.random() * Math.PI * 2;
    this.rv   = (Math.random() - 0.5) * 0.2;
    this.shape= Math.random() < 0.5 ? 'rect' : 'circle';
    this.grav = burst ? 0.4 : 0.05;
    this.life = 1;
    this.decay= burst ? 0.012 : 0.006;
  }
  update() {
    this.x   += this.vx;
    this.vy  += this.grav;
    this.y   += this.vy;
    this.rot += this.rv;
    this.life -= this.decay;
    if (this.y > canvas.height + 20) this.life = 0;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter(p => p.life > 0);
  pieces.forEach(p => { p.update(); p.draw(); });
  if (pieces.length > 0) animId = requestAnimationFrame(animateConfetti);
}

function startConfettiRain(count = 120) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      pieces.push(new Piece());
    }, i * 30);
  }
  if (!animId) animateConfetti();
  // Keep raining for 4s then stop new pieces
  setTimeout(() => { /* natural fade */ }, 4000);
}

function burstConfetti(x, y, count = 80) {
  for (let i = 0; i < count; i++) {
    pieces.push(new Piece(x, y, true));
  }
  if (!animId) {
    animId = null;
    animateConfetti();
  }
}

// ── Party button ───────────────────────────────
let partyActive = false;
function triggerParty() {
  partyActive = !partyActive;
  const btn  = document.getElementById('partyBtn');
  const body = document.body;

  if (partyActive) {
    btn.innerHTML = '<span>🎉 PARTY IS ON! 🎉</span>';
    body.classList.add('party-mode');
    startConfettiRain(200);

    // Burst from button
    const r = btn.getBoundingClientRect();
    burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 100);

    // Shake cake
    const cake = document.getElementById('cake');
    cake.style.animation = 'cakeFloat 0.2s ease-in-out infinite';
    setTimeout(() => {
      cake.style.animation = '';
    }, 2000);

  } else {
    btn.innerHTML = '<span>🎊 PRESS FOR PARTY 🎊</span>';
    body.classList.remove('party-mode');
  }
}

// Click anywhere to burst confetti
document.addEventListener('click', e => {
  if (e.target.closest('.party-btn')) return;
  burstConfetti(e.clientX, e.clientY, 30);
});

// ── Countdown timer ────────────────────────────
function getTarget() {
  const now    = new Date();
  const target = new Date(now);
  target.setDate(now.getDate() + 3);
  target.setHours(0, 0, 0, 0);
  return target;
}

const target = getTarget();

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const now  = new Date();
  const diff = target - now;

  if (diff <= 0) {
    document.getElementById('days').textContent    = '00';
    document.getElementById('hours').textContent   = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    // Party time!
    startConfettiRain(300);
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);

  const dEl = document.getElementById('days');
  const hEl = document.getElementById('hours');
  const mEl = document.getElementById('minutes');
  const sEl = document.getElementById('seconds');

  function updateEl(el, val) {
    const v = pad(val);
    if (el.textContent !== v) {
      el.style.transform = 'scale(1.3) rotateX(20deg)';
      el.style.transition = 'none';
      setTimeout(() => {
        el.textContent = v;
        el.style.transform = '';
        el.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1)';
      }, 80);
    }
  }

  updateEl(dEl, days);
  updateEl(hEl, hours);
  updateEl(mEl, minutes);
  updateEl(sEl, seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── Scroll-triggered card reveal ───────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.wish-card').forEach(card => {
  card.style.animationPlayState = 'paused';
  observer.observe(card);
});

// ── Auto rain on load ─────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => startConfettiRain(100), 800);
});

// ── Title tab animation ───────────────────────
const titles = [
  '🎂 Happy Birthday! 🎂',
  '🎉 YAY!! 🎉',
  '🥳 It\'s Party Time!',
  '🎈 Celebrate! 🎈',
  '✨ You\'re Special! ✨'
];
let ti = 0;
setInterval(() => {
  ti = (ti + 1) % titles.length;
  document.title = titles[ti];
}, 1500);
