

/* ============================================================
   TABS
   ============================================================ */
function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}

/* ============================================================
   ACCORDION + DARK MODE HELPERS
   ============================================================ */
function toggleAcc(btn) {
  // botón del encabezado de accordion; el cuerpo es el siguiente elemento
  const body = btn.nextElementSibling;
  if (!body) return;
  const open = body.classList.toggle('open');
  btn.classList.toggle('open', open);
  const icon = btn.querySelector('.acc-icon');
  if (icon) icon.textContent = open ? '−' : '+';
  // accessibility attributes
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  body.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-mode', isLight);
  const btn = document.querySelector('.btn-darkmode');
  if (btn) btn.textContent = isLight ? '☾ / ☀' : '☀ / ☾';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function toggleMode() {
  const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
  applyTheme(nextTheme);
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  applyTheme(saved === 'light' ? 'light' : 'dark');
}

/* Accessibility initialization: accordions, tabs, keyboard */
function initAccessibility() {
  // Accordions
  document.querySelectorAll('.acc-item').forEach((item, i) => {
    const btn = item.querySelector('.acc-header');
    const body = item.querySelector('.acc-body');
    if (!btn || !body) return;
    const id = body.id || `acc-body-${i}`;
    body.id = id;
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('aria-expanded', body.classList.contains('open') ? 'true' : 'false');
    body.setAttribute('role', 'region');
    body.setAttribute('aria-hidden', body.classList.contains('open') ? 'false' : 'true');
    // keyboard
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAcc(btn); }
    });
  });

  // Tabs
  const tabBar = document.querySelector('.tab-bar');
  if (tabBar) {
    tabBar.setAttribute('role', 'tablist');
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      const panel = document.getElementById('tab-' + btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1]);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('tabindex', btn.classList.contains('active') ? '0' : '-1');
      btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
      if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-hidden', panel.classList.contains('active') ? 'false' : 'true'); }
      btn.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const tabs = Array.from(document.querySelectorAll('.tab-btn'));
          const idx = tabs.indexOf(btn);
          const next = e.key === 'ArrowRight' ? tabs[(idx+1)%tabs.length] : tabs[(idx-1+tabs.length)%tabs.length];
          next.focus(); next.click();
        }
      });
    });
  }

  // Modal close aria
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) modalClose.setAttribute('aria-label', 'Cerrar información');

  // Nav toggle keyboard
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleNav(); } });
  }

  // Form controls ARIA
  const funcSelect = document.getElementById('funcSelect');
  if (funcSelect) funcSelect.setAttribute('aria-label', 'Seleccionar función f(x)');
  const customFunc = document.getElementById('customFuncInput');
  if (customFunc) customFunc.setAttribute('aria-label','Ingresar expresión personalizada de f(x)');
  const limA = document.getElementById('limA'); if (limA) limA.setAttribute('aria-label','Límite inferior a');
  const limB = document.getElementById('limB'); if (limB) limB.setAttribute('aria-label','Límite superior b');
  const nRange = document.getElementById('nRange'); if (nRange) nRange.setAttribute('aria-label','Número de rectángulos n');

  // Canvas accessible name
  const canvas = document.getElementById('simCanvas');
  if (canvas) { canvas.setAttribute('role','img'); canvas.setAttribute('aria-label','Gráfica de la función con rectángulos de Riemann'); }

  // Rtype buttons: aria-pressed and keyboard
  document.querySelectorAll('.rtype-btn').forEach(btn => {
    btn.setAttribute('role','button');
    btn.setAttribute('tabindex','0');
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
  });

  // History table label for screen readers
  const historyTable = document.querySelector('.history-table');
  if (historyTable) historyTable.setAttribute('aria-label', 'Historial de cálculos de Riemann');
}

function toggleNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const open = nav.classList.toggle('open');
  const btn = document.querySelector('.nav-toggle');
  if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

/* ============================================================
   RIEMANN TYPE CARDS (info section)
   ============================================================ */
function selectRiemannType(type, card) {
  document.querySelectorAll('.riemann-grid .riemann-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
}

/* ============================================================
   SIMULATOR
   ============================================================ */
const FUNCTIONS = {
  x2:       { fn: x => x*x,                        exact: (a,b) => b**3/3 - a**3/3,           label: 'x²' },
  x3:       { fn: x => x**3,                        exact: (a,b) => b**4/4 - a**4/4,           label: 'x³' },
  x4:       { fn: x => x**4,                        exact: (a,b) => b**5/5 - a**5/5,           label: 'x⁴' },
  exp_neg:  { fn: x => Math.exp(-x),               exact: (a,b) => -Math.exp(-b) + Math.exp(-a), label: 'e⁻ˣ' },
  sin_cos:  { fn: x => Math.sin(x)*Math.cos(x),    exact: (a,b) => 0.25*(Math.sin(2*b)-Math.sin(2*a)), label: 'sin(x)·cos(x)' },
  sinx:     { fn: x => Math.sin(x),                 exact: (a,b) => -Math.cos(b)+Math.cos(a),  label: 'sin(x)' },
  cosx:     { fn: x => Math.cos(x),                 exact: (a,b) => Math.sin(b)-Math.sin(a),   label: 'cos(x)' },
  ex:       { fn: x => Math.exp(x),                 exact: (a,b) => Math.exp(b)-Math.exp(a),   label: 'eˣ' },
  lnx:      { fn: x => x > 0 ? Math.log(x) : NaN,  exact: (a,b) => b*Math.log(b)-b - (a>0 ? a*Math.log(a)-a : 0), label: 'ln(x)' },
  sqrt:     { fn: x => x >= 0 ? Math.sqrt(x) : NaN,exact: (a,b) => (2/3)*(b**1.5 - (a>=0?a**1.5:0)), label: '√x' },
  arcsin:   { fn: x => Math.asin(x),               exact: (a,b) => b*Math.asin(b)+Math.sqrt(1-b*b) - (a*Math.asin(a)+Math.sqrt(1-a*a)), label: 'arcsin(x)' },
  arctan:   { fn: x => Math.atan(x),               exact: (a,b) => b*Math.atan(b)-0.5*Math.log(1+b*b) - (a*Math.atan(a)-0.5*Math.log(1+a*a)), label: 'arctan(x)' },
  inv_sqrt: { fn: x => Math.abs(x)<1 ? 1/Math.sqrt(1-x*x) : NaN, exact: (a,b) => Math.asin(b)-Math.asin(a), label: '1/√(1−x²)' },
  inv_quad: { fn: x => 1/(1+x*x),                  exact: (a,b) => Math.atan(b)-Math.atan(a),  label: '1/(1+x²)' },
  sin2:     { fn: x => Math.sin(x)**2,              exact: (a,b) => (b-a)/2 - (Math.sin(2*b)-Math.sin(2*a))/4, label: 'sin²(x)' },
};

let currentRtype = 'left';
let animFrame = null;

function setRtype(type) {
  currentRtype = type;
  ['left','right','mid'].forEach(t => {
    document.getElementById('rtype-'+t).classList.toggle('active', t===type);
  });
  updateSim();
}

function buildCustomFunction(expression) {
  const raw = expression.trim().replace(/\^/g, '**');
  const normalized = raw
    .replace(/\barcsin\b/gi, 'asin')
    .replace(/\barccos\b/gi, 'acos')
    .replace(/\barctan\b/gi, 'atan')
    .replace(/\bln\b/g, 'log')
    .replace(/\bpi\b/gi, 'PI')
    .replace(/\be\b/g, 'E');
  const body = `"use strict"; const {abs,acos,asin,atan,atan2,cos,exp,floor,log,max,min,pow,sin,sqrt,tan,PI,E}=Math; return ${normalized};`;
  const fn = new Function('x', body);
  fn(1); // validate at least once
  return fn;
}

function getSimFunction() {
  const customExpr = document.getElementById('customFuncInput')?.value.trim();
  if (customExpr) {
    try {
      const fn = buildCustomFunction(customExpr);
      return { fn, label: `f(x) = ${customExpr}`, exact: null, isCustom: true };
    } catch (err) {
      return { error: 'Función personalizada inválida. Verifica la sintaxis de x y las funciones Math.' };
    }
  }
  const sel = document.getElementById('funcSelect').value;
  return { ...FUNCTIONS[sel], label: FUNCTIONS[sel].label, isCustom: false };
}

function updateSim() {
  const fnData = getSimFunction();
  const a    = parseFloat(document.getElementById('limA').value);
  const b    = parseFloat(document.getElementById('limB').value);
  const n    = parseInt(document.getElementById('nRange').value);
  document.getElementById('nLabel').textContent = n;
  document.getElementById('nVal').textContent   = n;
  if (fnData.error) { showSimError(fnData.error); return; }
  const v = validateSimInputs(fnData, a, b, n);
  if (!v.valid) { showSimError(v.message); return; }
  clearSimError();
  drawSim(fnData, a, b, n, currentRtype);
  calcResults(fnData, a, b, n, currentRtype);
}

function showSimError(msg) {
  const el = document.getElementById('simErrors');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function clearSimError() {
  const el = document.getElementById('simErrors');
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
}

function validateSimInputs(fnData, a, b, n) {
  if (isNaN(a) || isNaN(b)) return { valid:false, message: 'Los límites a y b deben ser números.' };
  if (a >= b) return { valid:false, message: 'El límite inferior a debe ser menor que el límite superior b.' };
  if (!Number.isInteger(n) || n <= 0) return { valid:false, message: 'El número de rectángulos n debe ser un entero positivo.' };
  if (!fnData || typeof fnData.fn !== 'function') return { valid:false, message: 'Función no válida. Escribe una expresión correcta en el campo personalizado o elige una función predefinida.' };
  // domain-specific checks for built-in selections
  if (!fnData.isCustom) {
    if (fnData.label === 'ln(x)' && (a <= 0 || b <= 0)) return { valid:false, message: 'Para ln(x) los límites deben ser mayores que 0.' };
    if (fnData.label === '√x' && (b < 0)) return { valid:false, message: 'Para √x el límite superior debe ser ≥ 0.' };
    if (fnData.label === '1/√(1−x²)' && (a <= -1 || b >= 1)) return { valid:false, message: 'Para 1/√(1−x²) los límites deben estar en (−1,1).' };
  }
  return { valid:true };
}

function calcResults(fnData, a, b, n, rtype) {
  const dx = (b - a) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    let xi;
    if (rtype === 'left')  xi = a + i * dx;
    else if (rtype === 'right') xi = a + (i+1) * dx;
    else xi = a + (i + 0.5) * dx;
    const v = fnData.fn(xi);
    if (!isNaN(v) && isFinite(v)) sum += v * dx;
  }
  let ex = NaN;
  if (typeof fnData.exact === 'function') {
    try {
      ex = fnData.exact(a, b);
    } catch (err) { ex = NaN; }
  } else {
    ex = numericIntegral(fnData.fn, a, b, 1200);
  }
  const err = isFinite(ex) && ex !== 0 ? Math.abs((sum - ex)/ex)*100 : NaN;

  document.getElementById('riemannVal').textContent = sum.toFixed(5);
  document.getElementById('exactVal').textContent   = isFinite(ex) ? ex.toFixed(5) : 'aprox.';
  document.getElementById('errorVal').textContent   = isFinite(err) ? err.toFixed(3)+'%' : '—';

  const prec = isFinite(err) ? Math.max(0, 100 - err) : 0;
  document.getElementById('precBar').style.width  = isFinite(err) ? Math.min(100, prec).toFixed(1) + '%' : '0%';
  document.getElementById('precLabel').textContent = isFinite(err) ? Math.min(100, prec).toFixed(1) + '% preciso' : 'Sin exacto';
}

function numericIntegral(fn, a, b, steps = 1200) {
  const dx = (b - a) / steps;
  let result = 0;
  for (let i = 0; i <= steps; i++) {
    const x = a + i * dx;
    const y = fn(x);
    if (!isFinite(y) || isNaN(y)) return NaN;
    const weight = i === 0 || i === steps ? 1 : (i % 2 === 0 ? 2 : 4);
    result += weight * y;
  }
  return result * dx / 3;
}

function drawSim(fnData, a, b, n, rtype, highlightI = -1) {
  const canvas = document.getElementById('simCanvas');
  const ctx    = canvas.getContext('2d');
  const pixelRatio = (window.devicePixelRatio || 1) > 1.5 && window.innerWidth > 600 ? (window.devicePixelRatio || 1) : 1; // avoid too large on small screens
  const W      = Math.max(300, canvas.offsetWidth) * pixelRatio;
  const H      = Math.max(200, 400) * pixelRatio;
  canvas.width  = W;
  canvas.height = H;
  const w = canvas.offsetWidth;
  const h = 400;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const { fn, label } = fnData;
  const PAD = { top:30, right:30, bottom:40, left:55 };
  const pw = w - PAD.left - PAD.right;
  const ph = h - PAD.top  - PAD.bottom;

  // Compute range
  // adapt number of plotting points to available width for performance
  const pts = Math.min(800, Math.max(120, Math.floor(pw / 2)));
  let ymin = Infinity, ymax = -Infinity;
  for (let i = 0; i <= pts; i++) {
    const x = a + (b - a) * i / pts;
    const y = fn(x);
    if (isFinite(y) && !isNaN(y)) { ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
  }
  // Also include Riemann sample points
  const dx = (b-a)/n;
  for (let i=0;i<n;i++) {
    let xi = rtype==='left'?a+i*dx:rtype==='right'?a+(i+1)*dx:a+(i+.5)*dx;
    const y=fn(xi); if(isFinite(y)&&!isNaN(y)){ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
  }
  if (!isFinite(ymin)) { ymin = -1; ymax = 1; }
  const pad = (ymax - ymin) * .15 || 1;
  ymin -= pad; ymax += pad;
  if (ymin > 0) ymin = -0.1;

  const toX = x => PAD.left + (x - a) / (b - a) * pw;
  const toY = y => PAD.top  + (1 - (y - ymin) / (ymax - ymin)) * ph;

  // Background
  ctx.fillStyle = '#0f1218';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const x = PAD.left + i * pw / 8;
    ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + ph); ctx.stroke();
  }
  for (let i = 0; i <= 6; i++) {
    const y = PAD.top + i * ph / 6;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pw, y); ctx.stroke();
  }

  // Riemann rectangles
  for (let i = 0; i < n; i++) {
    let xi;
    if (rtype === 'left')  xi = a + i * dx;
    else if (rtype === 'right') xi = a + (i+1) * dx;
    else xi = a + (i + .5) * dx;
    const yi = fn(xi);
    if (!isFinite(yi) || isNaN(yi)) continue;
    const rx = toX(a + i * dx);
    const rw = Math.max(1, toX(a + (i+1)*dx) - rx - 1);
    const ry = toY(Math.max(yi, 0));
    const rh = Math.abs(toY(0) - toY(yi));

    if (i === highlightI) {
      ctx.fillStyle   = 'rgba(201,168,76,.7)';
      ctx.strokeStyle = 'rgba(201,168,76,1)';
    } else {
      ctx.fillStyle   = yi >= 0 ? 'rgba(78,201,176,.22)' : 'rgba(244,122,122,.22)';
      ctx.strokeStyle = yi >= 0 ? 'rgba(78,201,176,.55)' : 'rgba(244,122,122,.55)';
    }
    ctx.lineWidth = .8;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);
  }

  // Shaded area under curve (transparent)
  ctx.beginPath();
  ctx.moveTo(toX(a), toY(0));
  for (let i = 0; i <= pts; i++) {
    const x = a + (b - a) * i / pts;
    const y = fn(x);
    if (isFinite(y) && !isNaN(y)) ctx.lineTo(toX(x), toY(y));
  }
  ctx.lineTo(toX(b), toY(0));
  ctx.closePath();
  ctx.fillStyle = 'rgba(91,156,246,.1)';
  ctx.fill();

  // Curve
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#5b9cf6';
  let first = true;
  for (let i = 0; i <= pts * 2; i++) {
    const x = a + (b - a) * i / (pts*2);
    const y = fn(x);
    if (!isFinite(y) || isNaN(y)) { first = true; continue; }
    if (first) { ctx.moveTo(toX(x), toY(y)); first = false; }
    else ctx.lineTo(toX(x), toY(y));
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth   = 1.5;
  // x-axis
  const y0 = toY(0);
  ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + pw, y0); ctx.stroke();
  // y-axis
  ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + ph); ctx.stroke();

  // Axis labels
  ctx.fillStyle   = 'rgba(200,195,185,.6)';
  ctx.font        = `${10 * devicePixelRatio / devicePixelRatio}px 'JetBrains Mono', monospace`;
  ctx.textAlign   = 'center';
  for (let i = 0; i <= 4; i++) {
    const x  = a + (b - a) * i / 4;
    const px = toX(x);
    ctx.fillText(x.toFixed(1), px, PAD.top + ph + 18);
  }
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y  = ymin + (ymax - ymin) * i / 4;
    const py = toY(y);
    ctx.fillText(y.toFixed(2), PAD.left - 6, py + 4);
  }

  // Function label
  ctx.fillStyle = 'rgba(91,156,246,.9)';
  ctx.textAlign = 'left';
  ctx.font      = "bold 13px 'JetBrains Mono', monospace";
  ctx.fillText('f(x) = ' + label, PAD.left + 8, PAD.top + 18);
}

/* Animate */
function animateSim() {
  const fnData = getSimFunction();
  const a   = parseFloat(document.getElementById('limA').value);
  const b   = parseFloat(document.getElementById('limB').value);
  const n   = parseInt(document.getElementById('nRange').value);
  if (fnData.error) { showSimError(fnData.error); return; }
  const v = validateSimInputs(fnData,a,b,n);
  if (!v.valid) { showSimError(v.message); return; }
  clearSimError();
  if (animFrame) cancelAnimationFrame(animFrame);
  let i = 0;
  function step() {
    drawSim(fnData, a, b, n, currentRtype, i);
    i++;
    if (i < n) animFrame = requestAnimationFrame(step);
    else drawSim(fnData, a, b, n, currentRtype);
  }
  step();
}

/* Historial */
let history = [];
function saveHistory() {
  const fnData = getSimFunction();
  const a   = parseFloat(document.getElementById('limA').value);
  const b   = parseFloat(document.getElementById('limB').value);
  const n   = parseInt(document.getElementById('nRange').value);
  const rv  = document.getElementById('riemannVal').textContent;
  const ev  = document.getElementById('exactVal').textContent;
  const er  = document.getElementById('errorVal').textContent;
  if (fnData.error) { showSimError(fnData.error); return; }
  const v = validateSimInputs(fnData,a,b,n);
  if (!v.valid) { showSimError(v.message); return; }
  clearSimError();
  history.push({ fn: fnData.label, a, b, n, type: currentRtype, rv, ev, er });
  localStorage.setItem('riemannHistory', JSON.stringify(history));
  renderHistory();
}

/* Export / Import history */
function exportHistoryCSV() {
  if (!history || history.length === 0) return alert('No hay registros para exportar.');
  const rows = [['fn','a','b','n','type','rv','ev','er']];
  history.forEach(h => rows.push([h.fn,h.a,h.b,h.n,h.type,h.rv,h.ev,h.er]));
  const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'riemann_history.csv';
  document.body.appendChild(a); a.click(); a.remove();
}

function importHistoryFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) { history = parsed; localStorage.setItem('riemannHistory', JSON.stringify(history)); renderHistory(); }
      } else {
        // try parse CSV
        const lines = text.split(/\r?\n/).filter(Boolean);
        const data = lines.slice(1).map(l => {
          const cols = l.split(',').map(s => s.replace(/^"|"$/g, '').replace(/""/g,'"'));
          return { fn: cols[0], a: parseFloat(cols[1]), b: parseFloat(cols[2]), n: parseInt(cols[3]), type: cols[4], rv: cols[5], ev: cols[6], er: cols[7] };
        });
        history = data.concat(history);
        localStorage.setItem('riemannHistory', JSON.stringify(history)); renderHistory();
      }
    } catch (err) { alert('Error al importar archivo: ' + err.message); }
  };
  reader.readAsText(file);
}

// Wire export/import buttons
document.addEventListener('DOMContentLoaded', () => {
  const exp = document.getElementById('exportBtn');
  const imp = document.getElementById('importBtn');
  const fin = document.getElementById('importFile');
  if (exp) exp.addEventListener('click', exportHistoryCSV);
  if (imp && fin) imp.addEventListener('click', () => fin.click());
  if (fin) fin.addEventListener('change', e => { const f = e.target.files[0]; if (f) importHistoryFromFile(f); });
});

function initPage() {
  initTheme();
  initAccessibility();
  if (document.getElementById('simCanvas')) {
    loadHistory();
    updateSim();
    let _resizeTO = null;
    window.addEventListener('resize', () => {
      if (_resizeTO) clearTimeout(_resizeTO);
      _resizeTO = setTimeout(() => { updateSim(); _resizeTO = null; }, 180);
    });
  }
  if (document.getElementById('quizQuestion')) {
    renderQuestion();
  }
  const infoModal = document.getElementById('infoModal');
  if (infoModal) {
    infoModal.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

function renderHistory() {
  const tbody = document.getElementById('historyBody');
  if (history.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted)">Sin registros aún</td></tr>';
    return;
  }
  tbody.innerHTML = history.slice(-8).reverse().map(h => `
    <tr>
      <td>${h.fn}</td><td>${h.a}</td><td>${h.b}</td><td>${h.n}</td>
      <td>${h.type}</td><td>${h.rv}</td><td>${h.ev}</td><td>${h.er}</td>
    </tr>
  `).join('');
}

function clearHistory() {
  history = [];
  localStorage.removeItem('riemannHistory');
  renderHistory();
}

function loadHistory() {
  const saved = localStorage.getItem('riemannHistory');
  if (saved) {
    try { history = JSON.parse(saved) || []; } catch (e) { history = []; }
  }
  renderHistory();
}

/* ============================================================
   QUIZ
   ============================================================ */
const quizData = [
  {
    q: '¿Qué representa geométricamente la integral definida ∫ₐᵇ f(x) dx?',
    opts: ['La pendiente de f(x) en [a,b]', 'El área neta entre f(x) y el eje x en [a,b]', 'La derivada de f(x)', 'El máximo de f(x)'],
    ans: 1
  },
  {
    q: '¿Cuál es la integral indefinida de f(x) = 3x²?',
    opts: ['6x + C', 'x³ + C', '3x³ + C', 'x² + C'],
    ans: 1
  },
  {
    q: '¿Qué indica la constante C en una integral indefinida?',
    opts: ['El límite de integración', 'La familia completa de antiderivadas (constante arbitraria)', 'La velocidad de convergencia', 'El error de aproximación'],
    ans: 1
  },
  {
    q: '¿Cuál es la integral de 1/(1+x²)?',
    opts: ['ln(1+x²) + C', 'arcsin(x) + C', 'arctan(x) + C', '2x/(1+x²)² + C'],
    ans: 2
  },
  {
    q: 'En una Suma de Riemann con punto medio, ¿cómo se elige xᵢ*?',
    opts: ['xᵢ* = a + i·Δx', 'xᵢ* = a + (i-1)·Δx', 'xᵢ* = a + (i-½)·Δx', 'xᵢ* = (a+b)/2'],
    ans: 2
  },
  {
    q: '¿Qué establece el Teorema Fundamental del Cálculo?',
    opts: [
      'Que toda función continua es derivable',
      'Que la derivada e integral son operaciones inversas: ∫ₐᵇ f(x)dx = F(b)−F(a)',
      'Que las sumas de Riemann siempre convergen',
      'Que la integral de cualquier función es cero'
    ],
    ans: 1
  },
  {
    q: '¿Cuál es la integral de 1/√(1−x²)?',
    opts: ['arctan(x) + C', 'arcsin(x) + C', '-arccos(x)/x + C', 'ln|x| + C'],
    ans: 1
  },
  {
    q: 'Si se duplica el número de rectángulos n en una Suma de Riemann, el error de aproximación:',
    opts: ['Se duplica', 'Se reduce aproximadamente a la mitad', 'Se reduce a la cuarta parte (para punto medio)', 'No cambia'],
    ans: 2
  }
];

let qIndex = 0;
let score  = 0;
let answered = false;

function renderQuestion() {
  const d = quizData[qIndex];
  document.getElementById('quizQuestion').textContent = d.q;
  document.getElementById('quizProgress').textContent = `Pregunta ${qIndex+1} / ${quizData.length}`;
  document.getElementById('quizScore').textContent    = `Puntuación: ${score}`;
  document.getElementById('nextBtn').disabled = true;
  answered = false;
  const optsEl = document.getElementById('quizOptions');
  optsEl.innerHTML = '';
  d.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className    = 'quiz-opt';
    btn.textContent  = opt;
    btn.onclick      = () => answerQuiz(i, btn);
    optsEl.appendChild(btn);
  });
}

function answerQuiz(i, btn) {
  if (answered) return;
  answered = true;
  const correct = quizData[qIndex].ans;
  btn.classList.add(i === correct ? 'correct' : 'wrong');
  if (i === correct) {
    score++;
    document.getElementById('quizScore').textContent = `Puntuación: ${score}`;
  } else {
    document.querySelectorAll('.quiz-opt')[correct].classList.add('correct');
  }
  document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
  qIndex++;
  if (qIndex >= quizData.length) {
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('quizResult').style.display  = 'block';
    document.getElementById('finalScore').textContent    = `${score} / ${quizData.length}`;
    const pct = (score/quizData.length)*100;
    document.getElementById('finalMsg').textContent = pct >= 80
      ? '¡Excelente! Dominas el cálculo integral.'
      : pct >= 50 ? 'Buen intento. Revisa los temas donde fallaste.'
      : 'Sigue estudiando — los conceptos se aclaran con práctica.';
  } else {
    renderQuestion();
  }
}

function resetQuiz() {
  qIndex = 0; score = 0;
  document.getElementById('quizContent').style.display = 'block';
  document.getElementById('quizResult').style.display  = 'none';
  renderQuestion();
}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(title, body) {
  const overlay = document.getElementById('infoModal');
  document.getElementById('modalTitle').textContent  = title;
  document.getElementById('modalBody').textContent   = body;
  // save last focused element to restore later
  openModal._lastFocus = document.activeElement;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  const modal = overlay.querySelector('.modal');
  if (modal) modal.focus();

  // key handler for Escape and focus trap
  openModal._keyHandler = function(e) {
    if (e.key === 'Escape') { closeModal(); }
    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', openModal._keyHandler);
}

function closeModal() {
  const overlay = document.getElementById('infoModal');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  // restore focus
  try { if (openModal._lastFocus) openModal._lastFocus.focus(); } catch (e) {}
  if (openModal._keyHandler) { document.removeEventListener('keydown', openModal._keyHandler); openModal._keyHandler = null; }
}

document.getElementById('infoModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});