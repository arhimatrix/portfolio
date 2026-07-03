// interactive-diagrams.js
// 7 chapter-specific interactive simulations for Nina Velimirovic's portfolio
// Each diagram replaces the static sub-canvas with a full animated, mouse-reactive panel

window.ChapterDiagrams = {};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 1 · Mobility & Infrastructure Intelligence
// Interactive multimodal flow network — hover nodes to reveal transport data
// ─────────────────────────────────────────────────────────────────────────────
ChapterDiagrams.chapter1 = function(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr, frame = 0, mouse = { x: -1000, y: -1000 };

  const nodes = [
    { id: 'NEOM HQ', x: 0.5, y: 0.2, type: 'hub', data: 'Multimodal Hub · 170km rail corridor' },
    { id: 'Rail A', x: 0.15, y: 0.45, type: 'rail', data: 'High-Speed Rail · 300 km/h · Auto' },
    { id: 'Rail B', x: 0.82, y: 0.42, type: 'rail', data: 'Metro Loop · Driverless · Zero-carbon' },
    { id: 'Hub N', x: 0.3, y: 0.72, type: 'node', data: 'Logirhin Live · Freight Intelligence' },
    { id: 'Hub S', x: 0.68, y: 0.75, type: 'node', data: 'TOD District · 40k residents' },
    { id: 'Port', x: 0.5, y: 0.88, type: 'node', data: 'Port Node · Autonomous Logistics' }
  ];

  const edges = [
    [0,1],[0,2],[0,3],[0,4],[1,3],[2,4],[3,5],[4,5],[1,5]
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  function getNodePx(n) { return { x: n.x * W, y: n.y * H }; }

  function hoveredNode() {
    return nodes.find(n => {
      const p = getNodePx(n);
      return Math.hypot(p.x - mouse.x, p.y - mouse.y) < 28;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const t = frame * 0.012;

    // Grid
    ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const hov = hoveredNode();

    // Animated flow particles on edges
    edges.forEach(([ai, bi]) => {
      const a = getNodePx(nodes[ai]), b = getNodePx(nodes[bi]);
      ctx.strokeStyle = 'rgba(14,122,138,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

      // Particle
      const pct = ((t * 0.6 + ai * 0.3) % 1);
      const px = a.x + (b.x - a.x) * pct;
      const py = a.y + (b.y - a.y) * pct;
      ctx.fillStyle = 'rgba(14,122,138,0.7)';
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
    });

    // Nodes
    nodes.forEach(n => {
      const p = getNodePx(n);
      const isHov = hov === n;
      const pulse = isHov ? 14 + Math.sin(t*4)*3 : (n.type === 'hub' ? 12 : 8);

      ctx.beginPath(); ctx.arc(p.x, p.y, pulse, 0, Math.PI*2);
      ctx.fillStyle = isHov ? '#0E7A8A' : n.type === 'hub' ? '#0F172A' : '#fff';
      ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1.5;
      ctx.fill(); ctx.stroke();

      // Label
      ctx.fillStyle = isHov ? '#0E7A8A' : '#0F172A';
      ctx.font = `${isHov ? '500' : '400'} 9px "IBM Plex Mono"`;
      ctx.textAlign = 'center';
      ctx.fillText(n.id, p.x, p.y + pulse + 12);

      // Tooltip
      if (isHov) {
        const tw = ctx.measureText(n.data).width + 16;
        const tx = Math.min(Math.max(p.x - tw/2, 4), W - tw - 4);
        const ty = p.y - pulse - 28;
        ctx.fillStyle = '#0F172A';
        ctx.beginPath(); ctx.roundRect(tx, ty, tw, 20, 3); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '400 9px "IBM Plex Mono"';
        ctx.textAlign = 'left';
        ctx.fillText(n.data, tx + 8, ty + 13);
      }
    });

    // Label
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = '400 8px "IBM Plex Mono"'; ctx.textAlign = 'left';
    ctx.fillText('TOD NETWORK · HOVER NODES', 8, H - 8);
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  canvas.addEventListener('mouseleave', () => { mouse = { x: -1000, y: -1000 }; });

  resize(); window.addEventListener('resize', resize); loop();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 2 · Parametric & Material Systems
// Attractor-point panel field — drag to deform
// ─────────────────────────────────────────────────────────────────────────────
ChapterDiagrams.chapter2 = function(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr, frame = 0;
  let attractor = null;
  let dragging = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    if (!attractor) attractor = { x: W / 2, y: H / 2 };
  }

  function panelDepth(cx, cy) {
    const d = Math.hypot(cx - attractor.x, cy - attractor.y);
    const t = Math.max(0, 1 - d / Math.min(W, H) * 1.4);
    return t * t;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    const COLS = 18, ROWS = 10;
    const mx = 20, my = 20;
    const cw = (W - mx*2) / COLS, ch = (H - my*2) / ROWS;

    // Grid bg
    ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 25) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 25) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const px = mx + c * cw, py = my + r * ch;
        const cx = px + cw/2, cy = py + ch/2;
        const depth = panelDepth(cx, cy);
        const inset = 1.5 + depth * 7;
        const alpha = 0.12 + depth * 0.6;

        ctx.fillStyle = `rgba(14,122,138,${depth * 0.12})`;
        ctx.strokeStyle = `rgba(15,23,42,${alpha})`;
        ctx.lineWidth = 0.4 + depth * 0.9;
        ctx.beginPath();
        ctx.rect(px + inset, py + inset, cw - inset*2, ch - inset*2);
        ctx.fill(); ctx.stroke();

        if (depth > 0.4) {
          ctx.strokeStyle = `rgba(14,122,138,${depth * 0.35})`;
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(px+inset, py+inset); ctx.lineTo(px+cw-inset, py+ch-inset);
          ctx.stroke();
        }
      }
    }

    // Influence ring
    ctx.strokeStyle = 'rgba(14,122,138,0.1)'; ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(attractor.x, attractor.y, Math.min(W,H)*0.45, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);

    // Attractor crosshair
    const pulse = Math.sin(frame * 0.06) * 3;
    ctx.strokeStyle = 'rgba(14,122,138,0.8)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(attractor.x, attractor.y, 10 + pulse, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(14,122,138,0.5)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(attractor.x - 14, attractor.y); ctx.lineTo(attractor.x + 14, attractor.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(attractor.x, attractor.y - 14); ctx.lineTo(attractor.x, attractor.y + 14); ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = '400 8px "IBM Plex Mono"'; ctx.textAlign = 'left';
    ctx.fillText('ATTRACTOR FIELD · DRAG TO MOVE', 8, H - 8);
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    return e.touches
      ? { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
      : { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener('mousedown', e => { dragging = true; attractor = getPos(e); });
  canvas.addEventListener('mousemove', e => { if (dragging) attractor = getPos(e); });
  canvas.addEventListener('mouseup', () => dragging = false);
  canvas.addEventListener('mouseleave', () => dragging = false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; attractor = getPos(e); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if (dragging) attractor = getPos(e); }, { passive: false });
  canvas.addEventListener('touchend', () => dragging = false);

  resize(); window.addEventListener('resize', resize); loop();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 3 · Computational Design & Resilience
// Storm load stress simulation — click to toggle load scenario
// ─────────────────────────────────────────────────────────────────────────────
ChapterDiagrams.chapter3 = function(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr, frame = 0, scenario = 0;
  const scenarios = ['WIND LOAD · N', 'WIND LOAD · NE', 'STORM SURGE · S', 'SEISMIC · BASE'];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  function getStress(x, y, t) {
    const nx = x / W, ny = y / H;
    switch (scenario) {
      case 0: return Math.pow(1 - ny, 1.5) * (0.5 + Math.sin(nx * Math.PI * 2 + t) * 0.25);
      case 1: return Math.pow(1 - ny, 1.3) * (0.5 + Math.sin((nx + ny) * Math.PI * 2 + t) * 0.3);
      case 2: return (0.3 + Math.pow(ny, 2) * 0.7) * (0.6 + Math.cos(nx * Math.PI * 3 + t) * 0.2);
      case 3: return 0.4 + Math.sin(nx * Math.PI * 4 + t * 2) * Math.sin(ny * Math.PI * 3) * 0.4;
    }
  }

  function stressColor(v) {
    const r = Math.round(15 + v * 230);
    const g = Math.round(23 + (1-v) * 180);
    const b = Math.round(42 + (1-v) * 80);
    return `rgb(${r},${g},${b})`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const t = frame * 0.018;

    const COLS = 24, ROWS = 16;
    const cw = W / COLS, ch = H / ROWS;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cx = (c + 0.5) * cw, cy = (r + 0.5) * ch;
        const stress = getStress(cx, cy, t);
        ctx.fillStyle = stressColor(stress);
        ctx.globalAlpha = 0.85;
        ctx.fillRect(c * cw, r * ch, cw, ch);
      }
    }
    ctx.globalAlpha = 1;

    // Structural grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += cw) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += ch) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Scenario label
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '500 9px "IBM Plex Mono"'; ctx.textAlign = 'left';
    ctx.fillText(scenarios[scenario], 8, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '400 8px "IBM Plex Mono"';
    ctx.fillText('CLICK TO CHANGE LOAD', 8, H - 8);

    // Legend
    const lx = W - 60, ly = 8, lh = 60;
    for (let i = 0; i < lh; i++) {
      ctx.fillStyle = stressColor(1 - i/lh);
      ctx.fillRect(lx, ly + i, 10, 1);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '8px "IBM Plex Mono"'; ctx.textAlign = 'left';
    ctx.fillText('MAX', lx + 14, ly + 8);
    ctx.fillText('MIN', lx + 14, ly + lh);
  }

  function loop() { draw(); requestAnimationFrame(loop); }
  canvas.addEventListener('click', () => { scenario = (scenario + 1) % scenarios.length; });
  resize(); window.addEventListener('resize', resize); loop();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 4 · Robotics & Autonomous Systems
// Titan swarm pathfinding — agents navigate terrain, click to add obstacles
// ─────────────────────────────────────────────────────────────────────────────
ChapterDiagrams.chapter4 = function(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr, frame = 0;
  const agents = [], obstacles = [];
  const N = 9; // Titan 9-agent swarm
  let leaderIdx = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    if (agents.length === 0) initAgents();
  }

  function initAgents() {
    agents.length = 0;
    for (let i = 0; i < N; i++) {
      agents.push({
        x: 30 + Math.random() * (W - 60),
        y: 30 + Math.random() * (H - 60),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        trail: []
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const t = frame * 0.015;

    // Terrain noise bg
    ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Obstacles
    obstacles.forEach(o => {
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.strokeStyle = 'rgba(15,23,42,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(o.x - 14, o.y - 14, 28, 28, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px "IBM Plex Mono"'; ctx.textAlign = 'center';
      ctx.fillText('OBS', o.x, o.y + 3);
    });

    // Update + draw agents
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const flow = t * 0.5 + i * 0.7;
      a.vx += Math.cos(flow + a.y * 0.012) * 0.06;
      a.vy += Math.sin(flow + a.x * 0.012) * 0.06;

      // Avoid obstacles
      obstacles.forEach(o => {
        const dx = a.x - o.x, dy = a.y - o.y;
        const d = Math.hypot(dx, dy);
        if (d < 40) { a.vx += dx / d * 0.5; a.vy += dy / d * 0.5; }
      });

      // Separation
      agents.forEach((b, j) => {
        if (i === j) return;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 35 && d > 0) { a.vx += dx/d*0.3; a.vy += dy/d*0.3; }
      });

      // Wander noise
      a.vx += (Math.random() - 0.5) * 0.08;
      a.vy += (Math.random() - 0.5) * 0.08;

      // Dampen
      a.vx *= 0.97; a.vy *= 0.97;
      const spd = Math.hypot(a.vx, a.vy);
      if (spd > 2.5) { a.vx = a.vx/spd*2.5; a.vy = a.vy/spd*2.5; }

      a.x += a.vx; a.y += a.vy;
      if (a.x < 10) a.x += W; if (a.x > W - 10) a.x -= W;
      if (a.y < 10) a.y += H; if (a.y > H - 10) a.y -= H;

      a.trail.push({ x: a.x, y: a.y });
      if (a.trail.length > 20) a.trail.shift();

      // Trail
      if (a.trail.length > 1) {
        ctx.beginPath(); ctx.moveTo(a.trail[0].x, a.trail[0].y);
        a.trail.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = i === leaderIdx ? 'rgba(14,122,138,0.3)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.8; ctx.stroke();
      }

      // Proximity connections
      agents.forEach((b, j) => {
        if (j <= i) return;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) {
          ctx.strokeStyle = `rgba(14,122,138,${(1 - d/100) * 0.25})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      });

      // Agent dot
      const isLeader = i === leaderIdx;
      ctx.beginPath(); ctx.arc(a.x, a.y, isLeader ? 5 : 3.5, 0, Math.PI*2);
      ctx.fillStyle = isLeader ? '#0E7A8A' : '#0F172A';
      ctx.strokeStyle = isLeader ? '#0E7A8A' : '#fff';
      ctx.lineWidth = 1;
      ctx.fill(); ctx.stroke();
    }

    // Leader label
    const L = agents[leaderIdx];
    ctx.fillStyle = '#0E7A8A'; ctx.font = '400 8px "IBM Plex Mono"'; ctx.textAlign = 'center';
    ctx.fillText('LEADER', L.x, L.y - 10);

    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = '400 8px "IBM Plex Mono"'; ctx.textAlign = 'left';
    ctx.fillText(`N=${N} AGENTS · CLICK = OBSTACLE`, 8, H - 8);
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    obstacles.push({ x: e.clientX - r.left, y: e.clientY - r.top });
    if (obstacles.length > 8) obstacles.shift();
  });

  resize(); window.addEventListener('resize', resize); loop();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 5 · Human-Machine Collaboration & Digital Twins
// UMBRELLA Mars terrain + drone-rover coordination — click zones
// ─────────────────────────────────────────────────────────────────────────────
ChapterDiagrams.chapter5 = function(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr, frame = 0;
  let selectedZone = null;
  const zones = [], rover = { x: 0.5, y: 0.75, vx: 0, vy: 0 };
  const drone = { x: 0.5, y: 0.3, vx: 0, vy: 0, targetZone: null };
  const zoneLabels = ['TERRAIN A · SAFE', 'TERRAIN B · SCAN', 'TERRAIN C · HAZARD'];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    if (zones.length === 0) initZones();
  }

  function initZones() {
    zones.length = 0;
    zones.push({ x: 0.22, y: 0.55, r: 0.13, label: zoneLabels[0], status: 0 });
    zones.push({ x: 0.5, y: 0.45, r: 0.11, label: zoneLabels[1], status: 1 });
    zones.push({ x: 0.78, y: 0.6, r: 0.12, label: zoneLabels[2], status: 2 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const t = frame * 0.014;

    // Mars terrain heightmap-style bg
    const COLS = 30, ROWS = 20;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const nx = c / COLS, ny = r / ROWS;
        const h = Math.sin(nx * 8 + t * 0.2) * Math.cos(ny * 6 + t * 0.15) * 0.5 + 0.5;
        const v = Math.round(180 + h * 40);
        ctx.fillStyle = `rgb(${v},${Math.round(v*0.6)},${Math.round(v*0.5)})`;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(c * W/COLS, r * H/ROWS, W/COLS + 1, H/ROWS + 1);
      }
    }
    ctx.globalAlpha = 1;

    // Grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Zones
    zones.forEach((z, i) => {
      const px = z.x * W, py = z.y * H, pr = z.r * Math.min(W, H);
      const isSelected = selectedZone === i;
      const pulse = isSelected ? Math.sin(t * 4) * 3 : 0;
      const colors = ['rgba(14,122,138', 'rgba(100,116,139', 'rgba(239,68,68'];

      ctx.beginPath(); ctx.arc(px, py, pr + pulse, 0, Math.PI*2);
      ctx.fillStyle = `${colors[z.status]},0.08)`;
      ctx.strokeStyle = `${colors[z.status]},${isSelected ? 0.9 : 0.35})`;
      ctx.lineWidth = isSelected ? 1.5 : 0.7;
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = `${colors[z.status]},0.9)`;
      ctx.font = `${isSelected ? '500' : '400'} 8px "IBM Plex Mono"`;
      ctx.textAlign = 'center';
      ctx.fillText(z.label, px, py + pr + 14);
    });

    // Rover movement
    if (selectedZone !== null) {
      const tz = zones[selectedZone];
      const tx = tz.x * W, ty = tz.y * H + tz.r * Math.min(W, H) * 0.5;
      rover.vx += (tx - rover.x * W) * 0.002;
      rover.vy += (ty - rover.y * H) * 0.002;
    } else {
      rover.vx += Math.sin(t * 0.7) * 0.008;
      rover.vy += Math.cos(t * 0.5) * 0.008;
    }
    rover.vx *= 0.94; rover.vy *= 0.94;
    rover.x += rover.vx / W; rover.y += rover.vy / H;
    rover.x = Math.max(0.05, Math.min(0.95, rover.x));
    rover.y = Math.max(0.05, Math.min(0.95, rover.y));

    // Drone scouts toward selected zone
    if (selectedZone !== null) {
      const tz = zones[selectedZone];
      drone.vx += (tz.x - drone.x) * 0.003;
      drone.vy += (tz.y - drone.y) * 0.003;
    } else {
      drone.vx += Math.sin(t * 1.1 + 1) * 0.006;
      drone.vy += Math.cos(t * 0.9 + 2) * 0.006;
    }
    drone.vx *= 0.92; drone.vy *= 0.92;
    drone.x += drone.vx; drone.y += drone.vy;
    drone.x = Math.max(0.05, Math.min(0.95, drone.x));
    drone.y = Math.max(0.05, Math.min(0.95, drone.y));

    // Comms line rover <-> drone
    const rPx = rover.x * W, rPy = rover.y * H;
    const dPx = drone.x * W, dPy = drone.y * H;
    ctx.strokeStyle = 'rgba(14,122,138,0.3)'; ctx.lineWidth = 0.7;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(rPx, rPy); ctx.lineTo(dPx, dPy); ctx.stroke();
    ctx.setLineDash([]);

    // Rover
    ctx.fillStyle = '#0F172A'; ctx.strokeStyle = '#0E7A8A'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(rPx - 8, rPy - 6, 16, 12, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '6px "IBM Plex Mono"'; ctx.textAlign = 'center';
    ctx.fillText('R', rPx, rPy + 2);

    // Drone
    ctx.fillStyle = '#0E7A8A'; ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(dPx, dPy, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '6px "IBM Plex Mono"'; ctx.textAlign = 'center';
    ctx.fillText('D', dPx, dPy + 2);

    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '400 8px "IBM Plex Mono"'; ctx.textAlign = 'left';
    ctx.fillText('CLICK ZONE TO DEPLOY · R=ROVER D=DRONE', 8, H - 8);
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / W, my = (e.clientY - r.top) / H;
    let hit = null;
    zones.forEach((z, i) => {
      if (Math.hypot(mx - z.x, my - z.y) < z.r * 1.2) hit = i;
    });
    selectedZone = hit === selectedZone ? null : hit;
  });

  resize(); window.addEventListener('resize', resize); loop();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 6 · Planetary Urbanism & Sentient Infrastructure
// Horizon Protocol three-node lunar masterplan — click each node
// ─────────────────────────────────────────────────────────────────────────────
ChapterDiagrams.chapter6 = function(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr, frame = 0, activeNode = null;

  const nodes = [
    { id: 'SPACEPORT', desc: 'Polar surface · Auto landing · Solar array', x: 0.2, y: 0.3, icon: '▲' },
    { id: 'LAVA TUBE', desc: 'Subsurface habitat · 100 persons · Reflex Arc', x: 0.5, y: 0.65, icon: '⬡' },
    { id: 'ORBITAL', desc: 'Variable gravity · Station · SAMI skins', x: 0.8, y: 0.28, icon: '◎' }
  ];

  const links = [[0,1],[1,2],[0,2]];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const t = frame * 0.012;

    // Space background stars
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, W, H);
    if (frame === 1 || !window._horizonStars) {
      window._horizonStars = Array.from({ length: 80 }, () => ({
        x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.2, a: Math.random() * 0.6 + 0.2
      }));
    }
    window._horizonStars.forEach(s => {
      ctx.fillStyle = `rgba(255,255,255,${s.a * (0.5 + Math.sin(t * 0.5 + s.x * 10) * 0.3)})`;
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI*2); ctx.fill();
    });

    // Moon surface arc
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(W * 0.5, H * 1.4, H * 1.1, Math.PI, Math.PI*2); ctx.stroke();

    // Links
    links.forEach(([ai, bi]) => {
      const a = nodes[ai], b = nodes[bi];
      const ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H;
      const active = activeNode === ai || activeNode === bi;
      const pct = ((t * 0.4 + ai * 0.5) % 1);
      const px = ax + (bx - ax) * pct, py = ay + (by - ay) * pct;

      ctx.strokeStyle = active ? 'rgba(14,122,138,0.6)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = active ? 1.2 : 0.6;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = active ? 'rgba(14,122,138,0.9)' : 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
    });

    // Nodes
    nodes.forEach((n, i) => {
      const px = n.x * W, py = n.y * H;
      const isActive = activeNode === i;
      const pulse = isActive ? 20 + Math.sin(t * 4) * 4 : 16;

      ctx.beginPath(); ctx.arc(px, py, pulse, 0, Math.PI*2);
      ctx.fillStyle = isActive ? '#0E7A8A' : '#1E3A5F';
      ctx.strokeStyle = isActive ? '#5DCAA5' : 'rgba(255,255,255,0.25)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#fff'; ctx.font = `${isActive ? '600' : '400'} 10px "IBM Plex Mono"`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.icon, px, py);

      ctx.fillStyle = isActive ? '#5DCAA5' : 'rgba(255,255,255,0.5)';
      ctx.font = `${isActive ? '500' : '400'} 8px "IBM Plex Mono"`;
      ctx.textBaseline = 'top';
      ctx.fillText(n.id, px, py + pulse + 6);

      if (isActive) {
        const tw = ctx.measureText(n.desc).width + 16;
        const tx = Math.min(Math.max(px - tw/2, 4), W - tw - 4);
        const ty = py - pulse - 30;
        ctx.fillStyle = 'rgba(14,122,138,0.9)';
        ctx.beginPath(); ctx.roundRect(tx, ty, tw, 18, 3); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '400 8px "IBM Plex Mono"';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(n.desc, tx + 8, ty + 5);
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '400 8px "IBM Plex Mono"'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('LUNAR MASTERPLAN · CLICK NODE', 8, H - 8);
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let hit = null;
    nodes.forEach((n, i) => {
      if (Math.hypot(n.x * W - mx, n.y * H - my) < 28) hit = i;
    });
    activeNode = hit === activeNode ? null : hit;
  });

  resize(); window.addEventListener('resize', resize); loop();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 7 · Research & Synthesis
// EEG cognitive load wave — scroll/hover to scrub through rooms
// ─────────────────────────────────────────────────────────────────────────────
ChapterDiagrams.chapter7 = function(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr, frame = 0, mouseX = 0.5;

  const rooms = [
    { label: 'AIRLOCK', load: 0.85, color: '#E24B4A' },
    { label: 'OPS CENTER', load: 0.72, color: '#EF9F27' },
    { label: 'HABITAT', load: 0.41, color: '#1D9E75' },
    { label: 'LAB', load: 0.63, color: '#378ADD' },
    { label: 'EVA PREP', load: 0.91, color: '#D85A30' }
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const t = frame * 0.02;

    // Bg
    ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const activeRoom = Math.floor(mouseX * rooms.length);
    const room = rooms[Math.min(activeRoom, rooms.length - 1)];

    // EEG multi-band waves
    const bands = [
      { name: 'δ delta', f: 0.5, amp: 0.12, phase: 0 },
      { name: 'θ theta', f: 1.2, amp: 0.08, phase: 1 },
      { name: 'α alpha', f: 2.1, amp: 0.06, phase: 2 },
      { name: 'β beta', f: 4.5, amp: 0.04, phase: 3 },
      { name: 'γ gamma', f: 8.0, amp: 0.025, phase: 4 }
    ];

    bands.forEach((band, bi) => {
      const yBase = H * (0.22 + bi * 0.14);
      const amp = H * band.amp * (0.6 + room.load * 0.8);
      ctx.beginPath();
      for (let x = 0; x < W; x += 1.5) {
        const y = yBase + Math.sin(x * band.f * 0.05 + t * band.f + band.phase) * amp
                       + Math.sin(x * band.f * 0.03 + t * 0.7) * amp * 0.3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(15,23,42,${0.2 + bi * 0.08})`;
      ctx.lineWidth = 0.8 + bi * 0.1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.font = '8px "IBM Plex Mono"'; ctx.textAlign = 'left';
      ctx.fillText(band.name, 6, yBase + 4);
    });

    // Room indicator bar
    const bh = 24, by = H - bh - 4;
    rooms.forEach((r, i) => {
      const bx = (i / rooms.length) * W;
      const bw = W / rooms.length - 2;
      ctx.fillStyle = i === activeRoom ? r.color : 'rgba(0,0,0,0.08)';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh - 2, 2); ctx.fill();
      ctx.fillStyle = i === activeRoom ? '#fff' : 'rgba(0,0,0,0.3)';
      ctx.font = `${i === activeRoom ? '500' : '400'} 7px "IBM Plex Mono"`;
      ctx.textAlign = 'center';
      ctx.fillText(r.label, bx + bw/2, by + 13);
    });

    // Cognitive load gauge
    const gx = W - 60, gy = 10;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath(); ctx.roundRect(gx, gy, 52, 14, 2); ctx.fill();
    ctx.fillStyle = room.color;
    ctx.beginPath(); ctx.roundRect(gx, gy, 52 * room.load, 14, 2); ctx.fill();
    ctx.fillStyle = '#0F172A'; ctx.font = '7px "IBM Plex Mono"'; ctx.textAlign = 'center';
    ctx.fillText(`LOAD ${Math.round(room.load * 100)}%`, gx + 26, gy + 10);
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / W;
  });

  resize(); window.addEventListener('resize', resize); loop();
};

// ─────────────────────────────────────────────────────────────────────────────
// INIT — called after chapters are rendered in the DOM
// ─────────────────────────────────────────────────────────────────────────────
window.initChapterDiagrams = function() {
  for (let i = 1; i <= 7; i++) {
    const id = `canvas-sub-chapter${i}`;
    const canvas = document.getElementById(id);
    const fn = ChapterDiagrams[`chapter${i}`];
    if (canvas && fn) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      fn(canvas);
    }
  }
};
