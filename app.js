/* ============================================================
   PiForge — App JavaScript
   Circuit animation, form wizard, scroll effects
   ============================================================ */

// ── CIRCUIT BOARD CANVAS BACKGROUND ──────────────────────────
(function () {
  const canvas = document.getElementById('circuit-bg');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], paths = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildCircuit();
  }

  function buildCircuit() {
    nodes = [];
    paths = [];
    const spacing = 80;
    const cols = Math.ceil(W / spacing) + 1;
    const rows = Math.ceil(H / spacing) + 1;

    // Create grid nodes with randomness
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.45) {
          nodes.push({
            x: c * spacing + (Math.random() - 0.5) * 24,
            y: r * spacing + (Math.random() - 0.5) * 24,
            pulse: Math.random(),
            speed: 0.003 + Math.random() * 0.004
          });
        }
      }
    }

    // Connect nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 130 && Math.random() > 0.5) {
          // Only horizontal or vertical segments (circuit style)
          const horizontal = Math.random() > 0.5;
          paths.push({
            from: i, to: j,
            midX: horizontal ? nodes[j].x : nodes[i].x,
            midY: horizontal ? nodes[i].y : nodes[j].y,
            progress: 0,
            speed: 0.002 + Math.random() * 0.003,
            active: Math.random() > 0.6
          });
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw paths
    paths.forEach(p => {
      if (!p.active) return;
      const from = nodes[p.from];
      const to = nodes[p.to];

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(p.midX, p.midY);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Traveling pulse
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      // Position along L-shaped path
      const totalLen = Math.abs(p.midX - from.x) + Math.abs(p.midY - from.y) +
                       Math.abs(to.x - p.midX) + Math.abs(to.y - p.midY);
      const traveled = p.progress * totalLen;
      let px, py;
      const seg1 = Math.abs(p.midX - from.x) + Math.abs(p.midY - from.y);
      if (traveled < seg1) {
        const t = traveled / seg1;
        px = from.x + (p.midX - from.x) * t;
        py = from.y + (p.midY - from.y) * t;
      } else {
        const t = (traveled - seg1) / (totalLen - seg1);
        px = p.midX + (to.x - p.midX) * t;
        py = p.midY + (to.y - p.midY) * t;
      }

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach(n => {
      n.pulse += n.speed;
      const glow = (Math.sin(n.pulse) + 1) / 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 136, ${0.2 + glow * 0.5})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


// ── SCROLL EFFECTS ────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.build-card, .why-card, .spec-category').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});


// ── MOBILE MENU ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  mobileMenu.classList.remove('open');
}


// ── FORM WIZARD STATE ─────────────────────────────────────────
let currentStep = 1;
const formData = { model: '', storage: [], software: [], case: '', extras: [] };

function nextStep(step) {
  // Validate current step lightly
  if (currentStep === 1) {
    const model = document.querySelector('input[name="model"]:checked');
    const storage = document.querySelector('input[name="storage"]:checked');
    if (step > currentStep && (!model || !storage)) {
      highlightMissing(!model ? 'model' : 'storage');
      return;
    }
    if (model) formData.model = model.value;
    if (storage) formData.storage = storage.value;
  }

  if (currentStep === 3) {
    const c = document.querySelector('input[name="case"]:checked');
    if (c) formData.case = c.value;
    formData.extras = [...document.querySelectorAll('input[name="extra"]:checked')].map(i => i.value);
    if (step === 4) updateSummary();
  }

  // Gather software
  formData.software = [...document.querySelectorAll('input[name="software"]:checked')].map(i => i.value);

  // Hide current, show next
  document.getElementById('step' + currentStep).classList.remove('active');
  document.getElementById('step' + step).classList.add('active');

  // Update sidebar steps
  document.querySelectorAll('.config-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n === step) s.classList.add('active');
    else if (n < step) s.classList.add('done');
  });

  currentStep = step;
  document.querySelector('.config-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function highlightMissing(name) {
  const cards = document.querySelectorAll(`input[name="${name}"]`);
  cards.forEach(c => {
    c.closest('.option-card').querySelector('.option-inner').style.borderColor = '#C8173A';
    setTimeout(() => {
      c.closest('.option-card').querySelector('.option-inner').style.borderColor = '';
    }, 1500);
  });
}

const modelNames = {
  'pi5-4': 'Raspberry Pi 5 (4GB)',
  'pi5-8': 'Raspberry Pi 5 (8GB)',
  'pi4-8': 'Raspberry Pi 4 (8GB)',
  'pi-zero2': 'Pi Zero 2 W'
};
const storageNames = {
  '32': '32GB MicroSD', '64': '64GB MicroSD',
  'ssd256': '256GB NVMe SSD', 'ssd512': '512GB NVMe SSD',
  'ssd1tb': '1TB NVMe SSD', 'custom': 'Op maat opslag'
};
const softwareNames = {
  kodi: 'Kodi / LibreELEC', pihole: 'Pi-hole', nextcloud: 'Nextcloud',
  retropie: 'RetroPie', homeassistant: 'Home Assistant',
  omv: 'OpenMediaVault', docker: 'Docker + Portainer', wireguard: 'WireGuard VPN'
};
const caseNames = {
  none: 'Geen behuizing', standard: 'Standaard aluminium case',
  argon: 'Argon ONE', rack: 'Rack mount 19"', custom: 'Custom 3D print'
};

function updateSummary() {
  const sw = formData.software.map(s => softwareNames[s] || s).join(', ') || 'Geen software geselecteerd';
  const extras = formData.extras.map(e => ({ support3: '3 maanden support', remote: 'Remote beheer', update: 'Auto updates' }[e] || e)).join(', ');

  document.getElementById('summary-content').innerHTML = `
    <div style="display:grid;gap:0.5rem">
      <div><strong style="color:#00FF88">Model:</strong> ${modelNames[formData.model] || '—'}</div>
      <div><strong style="color:#00FF88">Opslag:</strong> ${storageNames[formData.storage] || '—'}</div>
      <div><strong style="color:#00FF88">Software:</strong> ${sw}</div>
      <div><strong style="color:#00FF88">Behuizing:</strong> ${caseNames[formData.case] || '—'}</div>
      ${extras ? `<div><strong style="color:#00FF88">Extra's:</strong> ${extras}</div>` : ''}
    </div>
  `;
}

function submitForm() {
  const name = document.querySelector('#step4 input[type="text"]')?.value;
  const email = document.querySelector('#step4 input[type="email"]')?.value;
  if (!email || !email.includes('@')) {
    document.querySelector('#step4 input[type="email"]').style.borderColor = '#C8173A';
    return;
  }
  // Show success
  document.getElementById('step4').classList.remove('active');
  document.getElementById('step5').classList.add('active');
  currentStep = 5;
}

function resetForm() {
  // Reset all inputs
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(i => i.checked = false);
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select')
    .forEach(i => i.value = '');

  document.getElementById('step5').classList.remove('active');
  document.getElementById('step1').classList.add('active');
  currentStep = 1;

  document.querySelectorAll('.config-step').forEach(s => {
    s.classList.remove('active', 'done');
    if (s.dataset.step === '1') s.classList.add('active');
  });
}

function contactSend(btn) {
  const orig = btn.textContent;
  btn.textContent = 'Verzonden ✓';
  btn.style.background = '#00FF88';
  btn.style.color = '#0A0E1A';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
  }, 3000);
}

// ── COPY XMR ADDRESS ──────────────────────────────────────────
function copyXMR(el) {
  const addr = el.textContent.trim();
  navigator.clipboard.writeText(addr).then(() => {
    const orig = el.textContent;
    el.textContent = '✓ Gekopieerd!';
    el.style.color = '#ffffff';
    setTimeout(() => { el.textContent = orig; el.style.color = ''; }, 2000);
  });
}
