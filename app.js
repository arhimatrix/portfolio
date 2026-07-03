// Core App controller for Nina Velimirovic's Portfolio
// Handles UI binding, scroll spy, image carousels, skill animations, and PDF export


class ContentsVectorField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.mouse = { x: -1000, y: -1000 };
    this.time = 0;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    
    // Agent list
    this.numAgents = 26;
    this.agents = [];
    
    this.resize();
    this.initAgents();
    
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    
    window.addEventListener('resize', () => this.resize());
    
    this.animate();
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 200;
    this.height = rect.height || 100;
    
    this.canvas.width = this.width * this.devicePixelRatio;
    this.canvas.height = this.height * this.devicePixelRatio;
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    
    // Clamp coordinates on resize
    if (this.agents && this.agents.length > 0) {
      this.agents.forEach(a => {
        a.x = Math.max(0, Math.min(this.width, a.x));
        a.y = Math.max(0, Math.min(this.height, a.y));
      });
    }
  }
  
  initAgents() {
    this.agents = [];
    for (let i = 0; i < this.numAgents; i++) {
      this.agents.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 2
      });
    }
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  
  handleMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }
  
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Shockwave ripple on click
    this.agents.forEach(a => {
      const dx = a.x - mx;
      const dy = a.y - my;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < 90) {
        const force = (1 - dist / 90) * 6.5;
        a.vx += (dx / dist) * force;
        a.vy += (dy / dist) * force;
      }
    });
  }
  
  update() {
    this.time += 0.03;
    
    this.agents.forEach(a => {
      // 1. Gentle wandering forces
      a.vx += (Math.random() - 0.5) * 0.08;
      a.vy += (Math.random() - 0.5) * 0.08;
      
      // 2. Attraction to mouse
      if (this.mouse.x > -500) {
        const dx = this.mouse.x - a.x;
        const dy = this.mouse.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 110) {
          const force = (1 - dist / 110) * 0.06;
          a.vx += (dx / dist) * force;
          a.vy += (dy / dist) * force;
        }
      }
      
      // Drag
      a.vx *= 0.95;
      a.vy *= 0.95;
      
      // Speed limit
      const speed = Math.hypot(a.vx, a.vy);
      const maxSpeed = 1.6;
      if (speed > maxSpeed) {
        a.vx = (a.vx / speed) * maxSpeed;
        a.vy = (a.vy / speed) * maxSpeed;
      }
      
      // Move
      a.x += a.vx;
      a.y += a.vy;
      
      // Boundaries bounce
      const padding = 5;
      if (a.x < padding) { a.x = padding; a.vx *= -1; }
      if (a.x > this.width - padding) { a.x = this.width - padding; a.vx *= -1; }
      if (a.y < padding) { a.y = padding; a.vy *= -1; }
      if (a.y > this.height - padding) { a.y = this.height - padding; a.vy *= -1; }
    });
  }
  
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Background color is pure white to match the aesthetic of the portfolio
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Subtle background ticks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    const tickSpacing = 20;
    for (let x = tickSpacing; x < this.width; x += tickSpacing) {
      for (let y = tickSpacing; y < this.height; y += tickSpacing) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }
    
    // Proximity connections threshold (breathing oscillation)
    const threshold = 68 + Math.sin(this.time * 0.5) * 8;
    
    // 1. Draw connections between agents
    ctx.lineWidth = 0.75;
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a1 = this.agents[i];
        const a2 = this.agents[j];
        const d = Math.hypot(a1.x - a2.x, a1.y - a2.y);
        
        if (d < threshold) {
          const alpha = (1 - d / threshold) * 0.18;
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a1.x, a1.y);
          ctx.lineTo(a2.x, a2.y);
          ctx.stroke();
        }
      }
    }
    
    // 2. Draw connections to mouse
    if (this.mouse.x > -500) {
      ctx.save();
      const mouseThreshold = 85;
      
      this.agents.forEach(a => {
        const d = Math.hypot(this.mouse.x - a.x, this.mouse.y - a.y);
        if (d < mouseThreshold) {
          const alpha = (1 - d / mouseThreshold) * 0.35;
          // Subtly color connections to the mouse in ice-blue/teal (var(--d-teal))
          ctx.strokeStyle = `rgba(0, 155, 158, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(this.mouse.x, this.mouse.y);
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
        }
      });
      ctx.restore();
    }
    
    // 3. Draw agents
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.0;
    this.agents.forEach(a => {
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    
    // 4. Draw mouse crosshairs if active
    if (this.mouse.x > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 155, 158, 0.35)'; // Teal crosshairs
      ctx.lineWidth = 0.5;
      
      ctx.beginPath();
      ctx.moveTo(this.mouse.x - 8, this.mouse.y);
      ctx.lineTo(this.mouse.x + 8, this.mouse.y);
      ctx.moveTo(this.mouse.x, this.mouse.y - 8);
      ctx.lineTo(this.mouse.x, this.mouse.y + 8);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(0, 155, 158, 0.6)';
      ctx.font = '7px IBM Plex Mono';
      const tooltip = `[X: ${Math.round(this.mouse.x)}, Y: ${Math.round(this.mouse.y)}]`;
      ctx.fillText(tooltip, this.mouse.x + 6, this.mouse.y - 3);
      ctx.restore();
    }
  }
  
  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

class ProceduralSwarmSimulator {
  constructor(canvasId, agentsInputId, speedInputId, cohesionInputId, agentsOutId, speedOutId, cohesionOutId, resetBtnId, waypointBtnId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.nAgentsEl = document.getElementById(agentsInputId);
    this.spdEl = document.getElementById(speedInputId);
    this.cohEl = document.getElementById(cohesionInputId);
    
    this.nOutEl = document.getElementById(agentsOutId);
    this.sOutEl = document.getElementById(speedOutId);
    this.cOutEl = document.getElementById(cohesionOutId);
    
    this.resetBtnEl = document.getElementById(resetBtnId);
    this.waypointBtnEl = document.getElementById(waypointBtnId);

    this.agents = [];
    this.targets = [];
    this.frame = 0;
    this.devicePixelRatio = window.devicePixelRatio || 1;

    this.resize();
    this.reset();

    // Bind event listeners
    if (this.nAgentsEl) {
      this.nAgentsEl.addEventListener('input', () => {
        if (this.nOutEl) this.nOutEl.textContent = this.nAgentsEl.value;
        this.reset();
      });
    }
    if (this.spdEl) {
      this.spdEl.addEventListener('input', () => {
        if (this.sOutEl) this.sOutEl.textContent = this.spdEl.value;
      });
    }
    if (this.cohEl) {
      this.cohEl.addEventListener('input', () => {
        if (this.cOutEl) this.cOutEl.textContent = this.cohEl.value;
      });
    }

    if (this.resetBtnEl) {
      this.resetBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        this.reset();
      });
    }
    if (this.waypointBtnEl) {
      this.waypointBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        this.addTarget();
      });
    }

    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    window.addEventListener('resize', () => this.resize());

    this.animate();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 300;
    this.height = rect.height || 120;

    this.canvas.width = this.width * this.devicePixelRatio;
    this.canvas.height = this.height * this.devicePixelRatio;
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
  }

  rnd(a, b) {
    return a + Math.random() * (b - a);
  }

  mkAgent() {
    return {
      x: this.rnd(20, this.width - 20),
      y: this.rnd(20, this.height - 20),
      vx: this.rnd(-1, 1),
      vy: this.rnd(-1, 1),
      trail: [],
      phase: this.rnd(0, Math.PI * 2)
    };
  }

  reset() {
    const n = this.nAgentsEl ? +this.nAgentsEl.value : 50;
    this.agents = Array.from({ length: n }, () => this.mkAgent());
    this.targets = [{ x: this.width * 0.5, y: this.height * 0.5, age: 0 }];
  }

  addTarget() {
    this.targets.push({
      x: this.rnd(30, this.width - 30),
      y: this.rnd(30, this.height - 30),
      age: 0
    });
    if (this.targets.length > 4) this.targets.shift();
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.targets.push({ x, y, age: 0 });
    if (this.targets.length > 4) this.targets.shift();
  }

  update() {
    const spd = this.spdEl ? +this.spdEl.value : 2;
    const coh = (this.cohEl ? +this.cohEl.value : 4) * 0.002;

    for (const a of this.agents) {
      // Attraction to nearest target
      let tx = 0, ty = 0, minD = Infinity;
      for (const t of this.targets) {
        const d = Math.hypot(a.x - t.x, a.y - t.y);
        if (d < minD) {
          minD = d;
          tx = t.x;
          ty = t.y;
        }
      }
      a.vx += (tx - a.x) * coh;
      a.vy += (ty - a.y) * coh;

      // Separation from neighbors
      for (const b of this.agents) {
        if (b === a) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 400 && d2 > 0) {
          const f = 0.35 / d2;
          a.vx += dx * f;
          a.vy += dy * f;
        }
      }

      // Noise
      a.vx += (Math.random() - 0.5) * 0.12;
      a.vy += (Math.random() - 0.5) * 0.12;

      // Clamp speed
      const v = Math.hypot(a.vx, a.vy);
      if (v > spd) {
        a.vx = (a.vx / v) * spd;
        a.vy = (a.vy / v) * spd;
      }

      // Boundaries bounce
      const padding = 15;
      if (a.x < padding) a.vx += 0.3;
      if (a.x > this.width - padding) a.vx -= 0.3;
      if (a.y < padding) a.vy += 0.3;
      if (a.y > this.height - padding) a.vy -= 0.3;

      a.trail.push({ x: a.x, y: a.y });
      if (a.trail.length > 14) a.trail.shift();

      a.x += a.vx;
      a.y += a.vy;
      a.phase += 0.04;
    }

    for (const t of this.targets) t.age++;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle dot grid
    ctx.fillStyle = 'rgba(0, 0, 0, 0.045)';
    const tickSpacing = 18;
    for (let x = tickSpacing; x < this.width; x += tickSpacing) {
      for (let y = tickSpacing; y < this.height; y += tickSpacing) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }

    // Draw waypoint targets — larger, more dramatic
    for (const t of this.targets) {
      const pulse = Math.sin(this.frame * 0.06) * 5;
      
      // Outer pulse ring
      ctx.strokeStyle = 'rgba(0, 155, 158, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 22 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.strokeStyle = '#009b9e';
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 10 + pulse * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Fill dot
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#009b9e';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = '#009b9e';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(t.x - 14, t.y); ctx.lineTo(t.x + 14, t.y);
      ctx.moveTo(t.x, t.y - 14); ctx.lineTo(t.x, t.y + 14);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Proximity lines — much stronger
    const threshold = 90;
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a1 = this.agents[i];
        const a2 = this.agents[j];
        const d = Math.hypot(a1.x - a2.x, a1.y - a2.y);
        if (d < threshold) {
          const alpha = (1 - d / threshold) * 0.6;
          ctx.strokeStyle = `rgba(0, 140, 155, ${alpha})`;
          ctx.lineWidth = (1 - d / threshold) * 1.2;
          ctx.beginPath();
          ctx.moveTo(a1.x, a1.y);
          ctx.lineTo(a2.x, a2.y);
          ctx.stroke();
        }
      }
    }

    // Trails and agents
    for (const a of this.agents) {
      // Trail
      if (a.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(a.trail[0].x, a.trail[0].y);
        for (let i = 1; i < a.trail.length; i++) {
          ctx.lineTo(a.trail[i].x, a.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(0, 140, 155, 0.18)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // Agent — larger with halo ring
      const pulse = (Math.sin(a.phase) * 0.3 + 0.7);

      // Outer halo
      ctx.strokeStyle = `rgba(0, 155, 158, ${pulse * 0.22})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Main dot
      ctx.fillStyle = '#009b9e';
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // White centre
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Status label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = '400 8px "IBM Plex Mono"';
    ctx.textAlign = 'left';
    ctx.fillText(`N=${this.agents.length} AGENTS · ${this.targets.length} WAYPOINTS · CLICK TO ADD`, 10, this.height - 10);
  }


  animate() {
    this.update();
    this.draw();
    this.frame++;
    requestAnimationFrame(() => this.animate());
  }
}

class RoboticAssemblySimulator {
  constructor(canvasId, logId, stabilityFillId, stabilityValId, progressFillId, progressValId, playBtnId, stepBtnId, faultBtnId, resetBtnId, syncStatusId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.logEl = document.getElementById(logId);
    this.stabFillEl = document.getElementById(stabilityFillId);
    this.stabValEl = document.getElementById(stabilityValId);
    this.progFillEl = document.getElementById(progressFillId);
    this.progValEl = document.getElementById(progressValId);
    
    this.playBtn = document.getElementById(playBtnId);
    this.stepBtn = document.getElementById(stepBtnId);
    this.faultBtn = document.getElementById(faultBtnId);
    this.resetBtn = document.getElementById(resetBtnId);
    this.syncEl = document.getElementById(syncStatusId);
    
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.frame = 0;
    this.isPlaying = true;
    this.faultInjected = false;
    this.currentStep = 0;
    this.allocating = false;
    this.delayTicks = 0;
    this.completeDelay = undefined;
    
    this.width = 200;
    this.height = 155;
    
    // Defer init so CSS layout has settled and canvas has its full width
    requestAnimationFrame(() => {
      this.resize();
      this.initStructure();
      this.initRobots();
      this.bindEvents();
      
      this.log("System initialized. 3 robotic agents online.", "info");
      this.log("Consensus bidding protocol active.", "info");
      
      this.animate();
      
      // Re-resize on window resize
      window.addEventListener('resize', () => {
        this.resize();
        this.initStructure();
        this.initRobots();
      });
    });
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 200;
    this.height = rect.height || 155;
    this.canvas.width = this.width * this.devicePixelRatio;
    this.canvas.height = this.height * this.devicePixelRatio;
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
  }
  
  initStructure() {
    this.modules = [];
    const centerX = this.width * 0.5;
    const centerY = 134.5; // Precise vertical align with pier top (132px) + block half-height
    const radius = 38;
    
    for (let i = 0; i < 12; i++) {
      const angle = Math.PI - (i + 0.5) * (Math.PI / 12);
      const targetX = centerX + Math.cos(angle) * radius;
      const targetY = centerY - Math.sin(angle) * radius;
      
      this.modules.push({
        id: i,
        angle: angle,
        targetX: targetX,
        targetY: targetY,
        placed: false
      });
    }
  }
  
  initRobots() {
    this.robots = [
      {
        id: 1,
        baseX: this.width * 0.24,
        baseY: this.height - 3,
        armX: this.width * 0.24,
        armY: this.height - 20,
        targetX: this.width * 0.24,
        targetY: this.height - 20,
        state: 'idle',
        allocatedModule: null,
        online: true
      },
      {
        id: 2,
        baseX: this.width * 0.50,
        baseY: this.height - 3,
        armX: this.width * 0.50,
        armY: this.height - 20,
        targetX: this.width * 0.50,
        targetY: this.height - 20,
        state: 'idle',
        allocatedModule: null,
        online: true
      },
      {
        id: 3,
        baseX: this.width * 0.76,
        baseY: this.height - 3,
        armX: this.width * 0.76,
        armY: this.height - 20,
        targetX: this.width * 0.76,
        targetY: this.height - 20,
        state: 'idle',
        allocatedModule: null,
        online: true
      }
    ];
  }
  
  bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isPlaying = !this.isPlaying;
        this.playBtn.textContent = this.isPlaying ? "PAUSE" : "PLAY";
        this.playBtn.classList.toggle('btn-active', !this.isPlaying);
      });
    }
    
    if (this.stepBtn) {
      this.stepBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isPlaying = false;
        if (this.playBtn) {
          this.playBtn.textContent = "PLAY";
          this.playBtn.classList.add('btn-active');
        }
        this.triggerNextAllocation();
      });
    }
    
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.reset();
      });
    }
    
    if (this.faultBtn) {
      this.faultBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFault();
      });
    }
    
    window.addEventListener('resize', () => this.resize());
  }
  
  log(msg, type = 'info') {
    if (!this.logEl) return;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const span = document.createElement('span');
    span.style.display = 'block';
    
    if (type === 'warn') {
      span.style.color = '#ef4444';
      span.style.fontWeight = 'bold';
    } else if (type === 'bid') {
      span.style.color = '#ef9f27';
    } else if (type === 'action') {
      span.style.color = '#009b9e';
      span.style.fontWeight = '500';
    } else {
      span.style.color = '#64748b';
    }
    
    span.textContent = `[${time}] ${msg}`;
    this.logEl.appendChild(span);
    this.logEl.scrollTop = this.logEl.scrollHeight;
    
    while (this.logEl.children.length > 25) {
      this.logEl.removeChild(this.logEl.firstChild);
    }
  }
  
  toggleFault() {
    this.faultInjected = !this.faultInjected;
    const r1 = this.robots[0];
    r1.online = !this.faultInjected;
    const led1 = document.querySelector('#robot-led-1 .led');
    
    if (this.faultInjected) {
      this.log("⚡ WARNING: Robot-1 offline! Sensor error.", "warn");
      this.log("⚡ [CONSENSUS] Recalculating task queues...", "warn");
      this.faultBtn.textContent = "⚡ CLEAR FAULT";
      this.faultBtn.classList.add('btn-active');
      if (led1) { led1.classList.remove('online'); led1.classList.add('offline'); }
      if (this.syncEl) { this.syncEl.textContent = "● REDUCED SYNC"; this.syncEl.classList.add('offline'); }
      if (r1.allocatedModule !== null) {
        const mid = r1.allocatedModule;
        this.modules[mid].placed = false;
        r1.allocatedModule = null;
        r1.state = 'returning';
        r1.targetX = r1.baseX;
        r1.targetY = r1.baseY - 20;
        this.log(`[SYSTEM] Module M0${mid + 1} re-queued.`, "warn");
      }
    } else {
      this.log("✔ Robot-1 online. Calibrating system.", "info");
      this.log("[CONSENSUS] Redundancy restored. 3 agents online.", "info");
      this.faultBtn.textContent = "⚡ FAULT";
      this.faultBtn.classList.remove('btn-active');
      if (led1) { led1.classList.remove('offline'); led1.classList.add('online'); }
      if (this.syncEl) { this.syncEl.textContent = "● TWIN SYNCED"; this.syncEl.classList.remove('offline'); }
    }
  }
  
  reset() {
    this.currentStep = 0;
    this.completeDelay = undefined;
    this.delayTicks = 0;
    
    this.modules.forEach(m => m.placed = false);
    this.robots.forEach(r => {
      r.state = 'idle';
      r.allocatedModule = null;
      r.targetX = r.baseX;
      r.targetY = r.baseY - 20;
      r.armX = r.baseX;
      r.armY = r.baseY - 20;
    });
    
    if (this.logEl) this.logEl.innerHTML = '';
    this.log("System reset. Starting new arch assembly.", "info");
    this.log("Consensus bidding protocol active.", "info");
    this.updateUI();
  }
  
  triggerNextAllocation() {
    if (this.currentStep >= 12) return;
    
    // Check if any robot is already busy placing or returning (wait till all idle/returning before next)
    const busy = this.robots.some(r => r.state === 'picking' || r.state === 'carrying');
    if (busy) return;
    
    const M = this.modules[this.currentStep];
    
    // Generate bids
    const bids = this.robots.map(r => {
      if (!r.online) return { id: r.id, score: -1, dist: Infinity };
      
      // Pickup supply position based on side
      const supplyX = M.id < 6 ? 12 : this.width - 12;
      const supplyY = M.id < 6 ? this.height - 18 - M.id * 5 : this.height - 18 - (11 - M.id) * 5;
      
      const distToSupply = Math.hypot(r.baseX - supplyX, r.baseY - supplyY);
      const distToPlacement = Math.hypot(r.baseX - M.targetX, r.baseY - M.targetY);
      const totalDist = distToSupply + distToPlacement;
      
      let score = 1 - totalDist / (this.width * 1.5);
      score += (Math.random() - 0.5) * 0.08; // small noise
      return {
        id: r.id,
        score: Math.max(0.1, score),
        dist: totalDist
      };
    });
    
    const activeBids = bids.filter(b => b.score > 0);
    if (activeBids.length === 0) return; // no online robots
    
    let maxScore = -1;
    let winnerId = 2;
    activeBids.forEach(b => {
      if (b.score > maxScore) {
        maxScore = b.score;
        winnerId = b.id;
      }
    });
    
    const winner = this.robots.find(r => r.id === winnerId);
    if (!winner) return;
    
    this.log(`Allocating Module M0${M.id + 1}...`, "info");
    activeBids.forEach(b => {
      this.log(`  Robot-${b.id} Bid: ${b.score.toFixed(2)} (dist: ${Math.round(b.dist)}px)`, "bid");
    });
    
    this.log(`  Robot-${winner.id} allocated. Consensus: OK.`, "action");
    
    // Set target to supply depot
    const supplyX = M.id < 6 ? 12 : this.width - 12;
    const supplyY = M.id < 6 ? this.height - 18 - M.id * 5 : this.height - 18 - (11 - M.id) * 5;
    
    winner.state = 'picking';
    winner.allocatedModule = M.id;
    winner.targetX = supplyX;
    winner.targetY = supplyY;
  }
  
  solveIK(bx, by, tx, ty) {
    const L1 = 26;
    const L2 = 26;
    let dx = tx - bx;
    let dy = ty - by;
    let d = Math.hypot(dx, dy);
    
    if (d > L1 + L2 - 0.1) {
      const angle = Math.atan2(dy, dx);
      tx = bx + Math.cos(angle) * (L1 + L2 - 0.1);
      ty = by + Math.sin(angle) * (L1 + L2 - 0.1);
      dx = tx - bx;
      dy = ty - by;
      d = L1 + L2 - 0.1;
    }
    
    const mx = bx + dx * 0.5;
    const my = by + dy * 0.5;
    
    const px = -dy;
    const py = dx;
    const pl = Math.hypot(px, py);
    
    let jx = mx;
    let jy = my;
    
    if (pl > 0) {
      const h2 = L1 * L1 - (d * 0.5) * (d * 0.5);
      const h = Math.sqrt(Math.max(0, h2));
      
      // Elbow up bend direction
      jx = mx - (dy / d) * h;
      jy = my + (dx / d) * h;
      if (jy > my) {
        jx = mx + (dy / d) * h;
        jy = my - (dx / d) * h;
      }
    }
    
    return { jx, jy };
  }
  
  update() {
    this.robots.forEach(r => {
      if (!r.online) {
        // Drop down to base resting position if offline
        r.targetX = r.baseX;
        r.targetY = r.baseY - 4;
      }
      
      const dx = r.targetX - r.armX;
      const dy = r.targetY - r.armY;
      const dist = Math.hypot(dx, dy);
      
      // Proportional speed easing: decelerate smoothly as target is approached
      const speed = Math.max(0.5, dist * 0.09);
      
      if (dist < speed) {
        r.armX = r.targetX;
        r.armY = r.targetY;
        
        // Handle transitions
        if (r.state === 'picking') {
          r.state = 'carrying';
          const M = this.modules[r.allocatedModule];
          r.targetX = M.targetX;
          r.targetY = M.targetY;
        } else if (r.state === 'carrying') {
          const M = this.modules[r.allocatedModule];
          M.placed = true;
          this.log(`[ROBOT-${r.id}] Module M0${M.id + 1} placed.`, "action");
          
          r.state = 'returning';
          r.targetX = r.baseX;
          r.targetY = r.baseY - 20;
          r.allocatedModule = null;
          
          this.currentStep++;
          this.updateUI();
        } else if (r.state === 'returning') {
          r.state = 'idle';
        }
      } else {
        r.armX += (dx / dist) * speed;
        r.armY += (dy / dist) * speed;
      }
    });
    
    // Auto scheduling of next task
    if (this.isPlaying && this.currentStep < 12) {
      const busy = this.robots.some(r => r.state === 'picking' || r.state === 'carrying');
      if (!busy) {
        if (this.delayTicks > 0) {
          this.delayTicks--;
        } else {
          this.triggerNextAllocation();
          this.delayTicks = 45; // Delay between tasks
        }
      }
    }
    
    // Check completion loop
    if (this.currentStep === 12) {
      if (this.completeDelay === undefined) {
        this.completeDelay = 150;
        this.log("✔ [SYSTEM] Arch assembly completed! Structure locked.", "action");
        this.log("[TWIN] State synchronized. Stability: 100%.", "info");
      } else if (this.completeDelay > 0) {
        this.completeDelay--;
      } else {
        this.completeDelay = undefined;
        this.reset();
      }
    }
  }
  
  updateUI() {
    const total = 12;
    const placed = this.modules.filter(m => m.placed).length;
    
    // Progress UI
    const progPct = (placed / total) * 100;
    if (this.progFillEl) this.progFillEl.style.width = `${progPct}%`;
    if (this.progValEl) this.progValEl.textContent = `${placed}/${total}`;
    
    // Stability UI
    let stabPct = Math.round(progPct);
    if (this.faultInjected && stabPct > 0) {
      stabPct = Math.max(0, stabPct - 8); // Redundancy penalty
    }
    if (this.stabFillEl) this.stabFillEl.style.width = `${stabPct}%`;
    if (this.stabValEl) this.stabValEl.textContent = `${stabPct}%`;
  }
  
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Subtle dot grid
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    const spacing = 20;
    for (let x = spacing; x < this.width; x += spacing) {
      for (let y = spacing; y < this.height; y += spacing) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }
    
    // Foundation piers — light grey
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 0.8;
    ctx.fillRect(57, this.height - 20, 11, 20); ctx.strokeRect(57, this.height - 20, 11, 20);
    ctx.fillRect(this.width - 68, this.height - 20, 11, 20); ctx.strokeRect(this.width - 68, this.height - 20, 11, 20);
    
    // Supply depots lines
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, this.height - 15); ctx.lineTo(20, this.height - 15);
    ctx.moveTo(this.width - 20, this.height - 15); ctx.lineTo(this.width - 4, this.height - 15);
    ctx.stroke();
    
    // Draw unplaced module stacks
    this.modules.forEach(M => {
      if (!M.placed) {
        let carried = false;
        this.robots.forEach(r => {
          if (r.allocatedModule === M.id && (r.state === 'carrying' || r.state === 'picking')) {
            carried = true;
          }
        });
        
        if (!carried) {
          ctx.save();
          if (M.id < 6) {
            ctx.translate(12, this.height - 18 - M.id * 5);
          } else {
            ctx.translate(this.width - 12, this.height - 18 - (11 - M.id) * 5);
          }
          ctx.fillStyle = '#CBD5E1';
          ctx.fillRect(-5, -2.5, 10, 5);
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(-5, -2.5, 10, 5);
          ctx.restore();
        }
      }
    });
    
    // Draw structural force flow (Thrust Line / Compression Path)
    const placedModules = this.modules.filter(m => m.placed);
    if (placedModules.length > 0) {
      ctx.save();
      ctx.beginPath();
      
      // Hook compression path to left pier if base block is placed
      if (this.modules[0].placed) {
        ctx.moveTo(this.width * 0.5 - 38, this.height - 20);
      } else {
        ctx.moveTo(placedModules[0].targetX, placedModules[0].targetY);
      }
      
      placedModules.forEach(M => {
        ctx.lineTo(M.targetX, M.targetY);
      });
      
      // Hook compression path to right pier if end block is placed
      if (this.modules[11].placed) {
        ctx.lineTo(this.width * 0.5 + 38, this.height - 20);
      }
      
      if (placedModules.length === 12) {
        // Locked structural arch: Solid stable teal compression vector
        ctx.strokeStyle = 'rgba(0, 155, 158, 0.85)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([]);
      } else {
        // Incomplete structure: Dashed unstable amber line
        ctx.strokeStyle = 'rgba(239, 159, 39, 0.6)';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 3]);
      }
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw placed modules (arch blocks)
    this.modules.forEach(M => {
      if (M.placed) {
        ctx.save();
        ctx.translate(M.targetX, M.targetY);
        ctx.rotate(M.angle + Math.PI / 2);
        
        ctx.fillStyle = '#009b9e';
        ctx.fillRect(-5, -2.5, 10, 5);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-5, -2.5, 10, 5);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(0, 0, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });
    
    // Draw carried modules at grippers
    this.robots.forEach(r => {
      if (r.state === 'carrying' && r.allocatedModule !== null) {
        ctx.save();
        ctx.translate(r.armX, r.armY);
        ctx.fillStyle = '#009b9e';
        ctx.fillRect(-5, -2.5, 10, 5);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-5, -2.5, 10, 5);
        ctx.restore();
      }
    });
    
    // Draw Robot Arms, Actuators, Plates, and Grippers
    this.robots.forEach(r => {
      const { jx, jy } = this.solveIK(r.baseX, r.baseY, r.armX, r.armY);
      
      // 1. Draw horizontal base plate platforms
      ctx.fillStyle = '#64748B';
      ctx.fillRect(r.baseX - 8, this.height - 3, 16, 3);
      ctx.fillStyle = '#475569';
      ctx.fillRect(r.baseX - 5, this.height - 6, 10, 3);
      
      // 2. Draw thick kinematic arm links
      ctx.strokeStyle = r.online ? '#475569' : 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r.baseX, r.baseY - 4);
      ctx.lineTo(jx, jy);
      ctx.lineTo(r.armX, r.armY);
      ctx.stroke();
      
      // 3. Draw elbow joint actuator caps (rotary joint simulation)
      ctx.fillStyle = r.online ? '#94A3B8' : '#FCA5A5';
      ctx.beginPath(); ctx.arc(jx, jy, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(jx, jy, 0.8, 0, Math.PI * 2); ctx.fill();
      
      // 4. Draw detailed state-dependent 2-finger grippers
      const armAngle = Math.atan2(r.armY - jy, r.armX - jx);
      ctx.save();
      ctx.translate(r.armX, r.armY);
      ctx.rotate(armAngle);
      
      ctx.strokeStyle = r.online ? '#334155' : '#EF4444';
      ctx.lineWidth = 1.0;
      ctx.lineCap = 'round';
      
      // Bracket base
      ctx.beginPath();
      ctx.moveTo(0, -3.5);
      ctx.lineTo(0, 3.5);
      ctx.stroke();
      
      // Fingers width (closed when carrying, open when scanning/picking/returning)
      const fWidth = (r.state === 'carrying') ? 1.6 : 3.6;
      
      // Left Finger
      ctx.beginPath();
      ctx.moveTo(0, -fWidth);
      ctx.lineTo(4, -fWidth);
      ctx.lineTo(5, -fWidth + 0.8);
      ctx.stroke();
      
      // Right Finger
      ctx.beginPath();
      ctx.moveTo(0, fWidth);
      ctx.lineTo(4, fWidth);
      ctx.lineTo(5, fWidth - 0.8);
      ctx.stroke();
      
      ctx.restore();
    });
  }
  
  animate() {
    this.update();
    this.draw();
    this.frame++;
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Load data from window.CVData
  const data = window.CVData;
  if (!data) {
    console.error("CV data not found. Please ensure cv-data.js is loaded.");
    return;
  }
  
  // Define loop video per chapter
  const chapterLoopVideos = {
    chapter1: { file: "NEOM/portfolio_assets/grok-video-47b058fd-4d08-4561-a3c0-796c5481acb0 (5).mp4", label: "NEOM Multimodal Station — Zero-Carbon Transport Hub · Occupant Flow" },
    chapter2: { file: "Stormcity/portfolio_assets/_users_9ab59cee-cd23-4c67-9c1a-0342e3602dda_generated_de855204-ac2a-4a84-a23a-90de118f7a7d_orbital_assembly_sequence.mp4", label: "Storm-Resilient City — Computational Structural Simulation · X-BIM Suite" },
    chapter3: { file: "Orbital City/portfolio_assets/IMG_9641.jpg", label: "Orbital Gateway — Full Station Assembly · In-Orbit Construction" },
    chapter4: { file: "Swarm Titan/portfolio_assets/_users_9ab59cee-cd23-4c67-9c1a-0342e3602dda_generated_57e991a2-05cc-4327-8eac-27a5b28f1450_orbital_assembly_sequence.mp4", label: "Titan Swarm — 9-Agent Cooperative Deployment · Prebiotic Terrain Mapping" },
    chapter6: { file: "Horizon Protocol/portfolio_assets/hero_lunar_structure.jpg", label: "Sentient Habitat — Parametric Lunar Structure · Horizon Protocol" }
  };

  // Additional stacked full-width videos per chapter, each optionally with its own gallery
  // galleryId: string key used for the drag-gallery id
  // images: [] = no gallery beneath this video
  const chapterVideoSections = {
    chapter1: [
      {
        file: "NEOM/portfolio_assets/neom_network_video.mp4",
        label: "Station Interior — Warm Structural Hall · NEOM Mobility Hub",
        galleryId: "gallery-ch1-beige",
        images: [
          { file: "NEOM/portfolio_assets/Neom HSR5.png", label: "Parametric Arch Canopy — Structural Hall Interior" },
          { file: "NEOM/portfolio_assets/Neom HSR6.png", label: "Integrated Transit Concourse — Warm Material Palette" },
          { file: "NEOM/portfolio_assets/Neom HSR7.png", label: "Arched Column Hall — Passenger Circulation Level" },
          { file: "NEOM/portfolio_assets/Neom HSR8.jpg", label: "Station Arch Barrel Vault — Structural Section" },
          { file: "NEOM/portfolio_assets/Neom HSR9.jpg", label: "Mobility Hub Public Realm — Level 2 Concourse" },
          { file: "NEOM/portfolio_assets/Neom HSR10.png", label: "Transit Hall Column Grid — Structural Integration" }
        ]
      },
      {
        file: "NEOM/portfolio_assets/grok-video-920b2d11-f65b-4a8b-8266-c280b32967fd (2).mp4",
        label: "Digital Wayfinding Layer — Smart Navigation Embedded in Built Environment",
        galleryId: "gallery-ch1-wayfinding",
        images: []
      }
    ],
    chapter4: [
      {
        file: "Swarm Titan/portfolio_assets/_users_9ab59cee-cd23-4c67-9c1a-0342e3602dda_generated_b6ddb01b-c94d-4bcd-bb9f-2e074efd404f_orbital_assembly_sequence.mp4",
        label: "Titan Rover-Drone — Technical Drawing Package · Design & Analysis",
        galleryId: "gallery-ch4-drawings",
        images: [
          { file: "Swarm Titan/portfolio_assets/IMG_3504.jpeg", label: "Exploded Assembly — Full Component Annotation Diagram" },
          { file: "Swarm Titan/portfolio_assets/IMG_3498.jpeg", label: "Orthographic Views — Front View" },
          { file: "Swarm Titan/portfolio_assets/IMG_3499.jpeg", label: "Orthographic Views — Right Side View" },
          { file: "Swarm Titan/portfolio_assets/IMG_3500.jpeg", label: "Orthographic Views — Back View" },
          { file: "Swarm Titan/portfolio_assets/IMG_3501.jpeg", label: "Orthographic Views — Left Side View" },
          { file: "Swarm Titan/portfolio_assets/IMG_3502.jpeg", label: "FEA Stress Analysis — Top View Heat Map · Structural Load" },
          { file: "Swarm Titan/portfolio_assets/IMG_3503.jpeg", label: "FEA Wireframe — 3D Structural Stress Distribution · Chassis" }
        ]
      }
    ]
  };

  // Define image mapping for the LOOP video gallery (appears directly after the hero video)
  const chapterImages = {
    chapter1: [
      { file: "NEOM/portfolio_assets/Neom HSR1.jpg", label: "Multimodal Station — Escalator Core · Red Station" },
      { file: "NEOM/portfolio_assets/Neom HSR2.png", label: "Platform Level — Dome Oculus · Occupant View" },
      { file: "NEOM/portfolio_assets/Neom HSR3.jpg", label: "Angular Interior — Raw Concrete · Station Spine" },
      { file: "NEOM/portfolio_assets/Neom HSR4.jpg", label: "Tunnel Section — Structural Core · NEOM HSR Platform" }
    ],
    chapter2: [
      { file: "Stormcity/portfolio_assets/IMG_3363.jpeg", label: "Clash Detection Workflow — Navisworks API · Model Alignment" },
      { file: "Stormcity/portfolio_assets/IMG_3365.jpeg", label: "Digital Twin Pipeline — Live Fabrication Tolerance Export" },
      { file: "Stormcity/portfolio_assets/IMG_3360.jpeg", label: "Storm-Resilient Envelope — Wind Load Simulation · X-BIM Dashboard" },
      { file: "Stormcity/portfolio_assets/mantis_simulation.mp4", label: "Mantis Simulation — Galapagos Evolutionary Solver" },
      { file: "Stormcity/portfolio_assets/IMG_3362.jpeg", label: "X-BIM Suite — Real-Time Sensor Tracking · Extreme Testing Chamber" }
    ],
    chapter3: [
      { file: "Orbital City/portfolio_assets/55f98a75-91e4-4433-8286-5c10fd24283d.jpeg", label: "Orbital Gateway — Station Approach Render" },
      { file: "Orbital City/portfolio_assets/b782dd39-5018-41f2-8326-4e6f61d2d376.jpeg", label: "Orbital Gateway — Docking Module Assembly" },
      { file: "Orbital City/portfolio_assets/d9fbe42a-0574-426e-b4df-59793c095bda.jpeg", label: "Orbital Gateway — In-Orbit Structural Frame" },
      { file: "Orbital City/portfolio_assets/IMG_2816.jpeg", label: "Gateway Construction — Primary Truss Assembly" },
      { file: "Orbital City/portfolio_assets/IMG_2818.jpeg", label: "Orbital Hub — Module Interface Detail" },
      { file: "Orbital City/portfolio_assets/IMG_2820.jpeg", label: "Microgravity Assembly — Robotic Handoff Sequence" },
      { file: "Orbital City/portfolio_assets/IMG_2822.jpeg", label: "Gateway Station — Pressurised Corridor Section" },
      { file: "Orbital City/portfolio_assets/IMG_2825.jpeg", label: "In-Orbit Construction — Structural Tolerance Study" },
      { file: "Orbital City/portfolio_assets/IMG_2828.jpeg", label: "Docking Ring — Interface Geometry Detail" },
      { file: "Orbital City/portfolio_assets/IMG_3182.jpeg", label: "Orbital Gateway — Full Station Overview" },
      { file: "Orbital City/portfolio_assets/IMG_3184.jpeg", label: "Construction Sequence — Module Staging Diagram" },
      { file: "Orbital City/portfolio_assets/IMG_3186.jpeg", label: "Gateway Node — Structural Hinge Assembly" },
      { file: "Orbital City/portfolio_assets/IMG_3189.jpeg", label: "Habitat Ring — Cross-Section Analysis" },
      { file: "Orbital City/portfolio_assets/IMG_3192.jpeg", label: "Orbital City — Masterplan Layout" },
      { file: "Orbital City/portfolio_assets/IMG_3194.png", label: "Station Plan — Level Distribution" },
      { file: "Orbital City/portfolio_assets/IMG_3195.png", label: "Gateway Section — Internal Spatial Logic" },
      { file: "Orbital City/portfolio_assets/IMG_3196.png", label: "Structural Diagram — Truss Node Network" },
      { file: "Orbital City/portfolio_assets/IMG_3539.jpeg", label: "Assembly Detail — Joint Connection Study" },
      { file: "Orbital City/portfolio_assets/IMG_3544.jpeg", label: "Orbital Gateway — Exterior Envelope Render" },
      { file: "Orbital City/portfolio_assets/IMG_3548.jpeg", label: "Module Interface — Pressure Seal System" },
      { file: "Orbital City/portfolio_assets/IMG_3564.jpg", label: "Gateway Render — Orbital Approach View" },
      { file: "Orbital City/portfolio_assets/IMG_3568.png", label: "Construction Phase — Robot Assembly Arm" },
      { file: "Orbital City/portfolio_assets/IMG_9641.jpg", label: "Final Render — Orbital Gateway Full Assembly" },
      { file: "Orbital City/portfolio_assets/IMG_9643.jpg", label: "Night Render — Station Illumination Study" },
      { file: "Orbital City/portfolio_assets/IMG_9646.png", label: "Detail Render — Docking Bay & Approach Path" }
    ],
    chapter4: [
      { file: "Swarm Titan/portfolio_assets/IMG_3498.jpeg", label: "Titan Rover-Drone — Front View Orthographic" },
      { file: "Swarm Titan/portfolio_assets/IMG_3499.jpeg", label: "Titan Rover-Drone — Right Side View" },
      { file: "Swarm Titan/portfolio_assets/IMG_3500.jpeg", label: "Titan Rover-Drone — Back View Orthographic" },
      { file: "Swarm Titan/portfolio_assets/IMG_3501.jpeg", label: "Titan Rover-Drone — Left Side View" },
      { file: "Swarm Titan/portfolio_assets/IMG_3502.jpeg", label: "FEA Stress Analysis — Top View Heat Map" },
      { file: "Swarm Titan/portfolio_assets/IMG_3503.jpeg", label: "Wireframe FEA — 3D Stress Distribution · Chassis" },
      { file: "Swarm Titan/portfolio_assets/IMG_3504.jpeg", label: "Exploded Assembly — Component Annotation Diagram" },
      { file: "Swarm Titan/portfolio_assets/IMG_3505.jpeg", label: "Swarm Deployment — Titan Terrain Simulation" },
      { file: "Swarm Titan/portfolio_assets/IMG_3506.jpeg", label: "Agent Network — Delay-Tolerant Mesh Topology" },
      { file: "Swarm Titan/portfolio_assets/IMG_3507.jpeg", label: "Cooperative Pathfinding — Multi-Agent Grid Map" },
      { file: "Swarm Titan/portfolio_assets/IMG_3508.jpeg", label: "UE5 Terrain Simulation — Atmospheric Haze Layer" },
      { file: "Swarm Titan/portfolio_assets/IMG_3509.jpeg", label: "Physical Prototype — Rover + CrazyFlie Drone" },
      { file: "Swarm Titan/portfolio_assets/IMG_3510.jpeg", label: "Hardware Test — Inter-Agent Communication" },
      { file: "Swarm Titan/portfolio_assets/IMG_3511.jpeg", label: "Rotor-Wheel Architecture — Mode Transition Study" },
      { file: "Swarm Titan/portfolio_assets/IMG_3512.jpeg", label: "MBSE Package — System Block Diagram" },
      { file: "Swarm Titan/portfolio_assets/IMG_3513.jpeg", label: "FMECA Matrix — Failure Mode Analysis" },
      { file: "Swarm Titan/portfolio_assets/IMG_3514.jpeg", label: "Mass-Power Budget — Data Link Allocation" },
      { file: "Swarm Titan/portfolio_assets/IMG_3515.jpeg", label: "Swarm Leader Election — Consensus Algorithm" }
    ],
    chapter6: [
      { file: "Horizon Protocol/portfolio_assets/IMG_3758.png", label: "Sentient Hub — Orbital Approach · Lunar Surface" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3759.png", label: "SAMI Kinetic Skin — Adaptive Facade System" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3760.png", label: "Reflex Arc Logic Gate — Life-Support Module" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3761.png", label: "Lunar Village Masterplan — Panoramic Overview" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3762.png", label: "Subsurface Lava Tube — Habitat Interior" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3762 (1).png", label: "Variable-Gravity Orbital Station — Docking Bay" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3762 (2).png", label: "Spaceport Surface Module — Launch Pad Integration" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3763.png", label: "Parametric Shell — Structural Skin Detail" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3763 (1).png", label: "Lunar Village Masterplan — Zone Overview" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3764.jpeg", label: "Underground Habitat — Cross-Section · Lava Tube" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3765.jpeg", label: "Bio-Reactive Panel — SAMI Illumination Response" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3766.jpeg", label: "Surface Spaceport — Transit Corridor" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3767.jpeg", label: "Reflex Arc Sensor Node — Zone Boundary" },
      { file: "Horizon Protocol/portfolio_assets/IMG_3768.jpeg", label: "Habitat Ring — Internal Circulation Level" }
    ],
    chapter7: []
  };

  // 1. Bind Personal details
  document.querySelectorAll('.js-profile-name').forEach(el => el.textContent = data.personal.name);
  document.querySelectorAll('.js-profile-title').forEach(el => el.textContent = data.personal.title);
  const contactText = `${data.personal.location}  |  ${data.personal.email}  |  ${data.personal.phone}`;
  document.querySelectorAll('.js-profile-contact').forEach(el => el.textContent = contactText);
  const bioEl = document.getElementById('profile-bio');
  if (bioEl) bioEl.textContent = data.personal.profileText;
  
  // Set social links in CV header
  const linkedinEl = document.getElementById('cv-linkedin');
  if (linkedinEl) {
    linkedinEl.textContent = data.personal.linkedin;
    linkedinEl.href = `https://${data.personal.linkedin}`;
  }

  // Python syntax highlighting helper
  function highlightPythonCode(code) {
    if (!code) return '';
    return code
      .replace(/#.*/g, match => `<span class="c">${match}</span>`) // comments
      .replace(/\b(def|for|in|if|and|not|return)\b/g, match => `<span class="k">${match}</span>`) // keywords
      .replace(/([a-zA-Z0-9_]+)(?=\()/g, match => `<span class="f">${match}</span>`); // function calls
  }

  // Helper to get full path for media files
  const getImgPath = (file) => file.includes('/') ? file : `NEOM/Neom/${file}`;

  // 2. Render Chapters
  const chaptersContainer = document.getElementById('chapters-container');
  if (chaptersContainer) {
    chaptersContainer.innerHTML = ''; // clear
    data.chapters.forEach(ch => {
      const imgArray = chapterImages[ch.id] || [];
      const loopVideo = chapterLoopVideos[ch.id];
      const videoSections = chapterVideoSections[ch.id] || [];
      const hasAnyMedia = imgArray.length > 0 || !!loopVideo || videoSections.length > 0;
      
      // Helper: render one gallery row
      const renderGallery = (items, gid) => {
        if (!items || items.length === 0) return '';
        return `
          <div class="drag-gallery" id="${gid}">
            ${items.map((img, idx) => {
              const path = getImgPath(img.file);
              const isVid = path.endsWith('.mp4') || path.endsWith('.webm');
              return isVid ? `
                <div class="gallery-card" onclick="openLightbox('${path}','${img.label.replace(/'/g,"\\'")}','${gid}',${idx})">
                  <video src="${path}" muted playsinline loop onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;"></video>
                  <div class="gallery-card-video-badge">&#9654;</div>
                  <div class="gallery-card-caption">${img.label}</div>
                </div>` : `
                <div class="gallery-card" onclick="openLightbox('${path}','${img.label.replace(/'/g,"\\'")}','${gid}',${idx})">
                  <img src="${path}" alt="${img.label}" loading="lazy">
                  <div class="gallery-card-caption">${img.label}</div>
                </div>`;
            }).join('')}
          </div>`;
      };

      const chapterHTML = `
        <article class="chapter-block scene light" id="${ch.id}">

          <!-- Two-column: text left, optional sidebar right -->
          <div class="chapter-layout-grid">

            <!-- Text column -->
            <div class="chapter-text-col">
              <span class="chapter-num-badge">Chapter 0${ch.num}</span>
              <h2 class="profile-headline">${ch.title}</h2>

              <div class="chapter-focus-banner">
                <strong>Focus &mdash;</strong> ${ch.theme}
              </div>

              <p class="profile-para">${ch.summary}</p>

              <ul class="chapter-bullets">
                ${ch.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>

              <div class="chapter-tags">
                ${ch.tags.map(t => `<span class="tag">${t}</span>`).join('')}
              </div>

              ${ch.id === 'chapter4' ? `
                <div style="margin-top: 20px;">
                  <a href="titan-swarm.html" class="btn-academic" target="_blank" style="display:inline-block;font-weight:bold;border:1.5px solid var(--d-teal);color:var(--d-teal);text-decoration:none;">
                    LAUNCH DUAL-MODE SWARM SIMULATOR &amp; CAD INSPECTOR &#8599;
                  </a>
                </div>
              ` : ''}
            </div>

            <!-- Empty right col (no media in column anymore) -->
            <div class="chapter-image-col chapter-image-col--empty"></div>

          </div>

          <!-- Full-width media zone: loop video + its gallery -->
          ${hasAnyMedia ? `
            <div class="chapter-fullwidth-media" style="display:block;width:calc(100vw - 9vw);margin-left:9vw;padding-bottom:40px;box-sizing:border-box;overflow:hidden;">

              ${loopVideo ? `
                <div class="chapter-fw-video" style="width:100%;aspect-ratio:1/1;overflow:hidden;position:relative;cursor:pointer;border:1px solid #C5D0D6;background:#000;" onclick="openLightbox('${getImgPath(loopVideo.file)}','${loopVideo.label.replace(/'/g,"\\'")}')"> 
                  ${(loopVideo.file.endsWith('.mp4') || loopVideo.file.endsWith('.webm')) ? `
                    <video src="${getImgPath(loopVideo.file)}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;display:block;"></video>
                  ` : `
                    <img src="${getImgPath(loopVideo.file)}" alt="${loopVideo.label}" style="width:100%;height:100%;object-fit:cover;display:block;">
                  `}
                  <div class="main-image-overlay">${loopVideo.label}</div>
                </div>
              ` : ''}
              ${imgArray.length > 0 ? renderGallery(imgArray, 'gallery-' + ch.id + '-loop') : ''}

              ${videoSections.map((vs, vi) => `
                <div class="chapter-fw-video" style="width:100%;aspect-ratio:1/1;overflow:hidden;position:relative;cursor:pointer;border:1px solid #C5D0D6;background:#000;margin-top:32px;" onclick="openLightbox('${getImgPath(vs.file)}','${vs.label.replace(/'/g,"\\'")}')">
                  <video src="${getImgPath(vs.file)}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;display:block;"></video>
                  <div class="main-image-overlay">${vs.label}</div>
                </div>
                ${vs.images && vs.images.length > 0 ? renderGallery(vs.images, vs.galleryId) : ''}
              `).join('')}

            </div>
          ` : ''}

        </article>
      `;
      chaptersContainer.insertAdjacentHTML('beforeend', chapterHTML);
    });
  }

  // Initialize drag-to-scroll on all drag galleries
  function initDragGalleries() {
    document.querySelectorAll('.drag-gallery').forEach(gallery => {
      let isDown = false;
      let startX;
      let scrollLeft;

      gallery.addEventListener('mousedown', e => {
        isDown = true;
        gallery.classList.add('dragging');
        startX = e.pageX - gallery.offsetLeft;
        scrollLeft = gallery.scrollLeft;
        e.preventDefault();
      });

      gallery.addEventListener('mouseleave', () => {
        isDown = false;
        gallery.classList.remove('dragging');
      });

      gallery.addEventListener('mouseup', () => {
        isDown = false;
        gallery.classList.remove('dragging');
      });

      gallery.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - gallery.offsetLeft;
        const walk = (x - startX) * 1.4;
        gallery.scrollLeft = scrollLeft - walk;
      });
    });
  }
  initDragGalleries();

  // 3. Render CV Experience
  const expContainer = document.getElementById('cv-experience-container');
  if (expContainer) {
    expContainer.innerHTML = '';
    data.experience.forEach(exp => {
      const expHTML = `
        <div class="cv-entry">
          <div class="cv-entry-header">
            <div>
              <h4 class="cv-entry-role">${exp.role}</h4>
              <span class="cv-entry-company">${exp.company}</span>
            </div>
            <div class="cv-entry-meta">
              <span class="cv-entry-period">${exp.period}</span>
              <span class="cv-entry-location">${exp.location}</span>
            </div>
          </div>
          <p class="cv-entry-desc">${exp.description}</p>
          <ul class="cv-entry-bullets">
            ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `;
      expContainer.insertAdjacentHTML('beforeend', expHTML);
    });
  }

  // 4. Render CV Education
  const eduContainer = document.getElementById('cv-education-container');
  if (eduContainer) {
    eduContainer.innerHTML = '';
    data.education.forEach(edu => {
      const eduHTML = `
        <div class="education-card">
          <h4 class="education-degree">${edu.degree}</h4>
          <div class="education-school">${edu.school}</div>
          <span class="education-period">${edu.location} | ${edu.period}</span>
          <p class="education-focus">${edu.focus}</p>
        </div>
      `;
      eduContainer.insertAdjacentHTML('beforeend', eduHTML);
    });
  }

  // 5. Render CV Affiliations
  const affContainer = document.getElementById('cv-affiliations-container');
  if (affContainer) {
    affContainer.innerHTML = '';
    data.affiliations.forEach(aff => {
      affContainer.insertAdjacentHTML('beforeend', `<li>${aff}</li>`);
    });
  }

  // 6. Render Skills Matrix
  const skillsContainer = document.getElementById('skills-container');
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    // Group skills by category
    const categories = {
      software: "Software Development & Languages",
      robotics: "Robotics & Systems Engineering",
      simulation: "Simulators & Virtual Environments",
      design: "Computational Design & BIM",
      research: "Academic Research & User Studies"
    };
    
    Object.keys(categories).forEach(cat => {
      const catSkills = data.skills.filter(s => s.category === cat);
      if (catSkills.length === 0) return;
      
      const catHTML = `
        <div class="skill-category-card">
          <h3>${categories[cat]}</h3>
          <div class="skill-bars">
            ${catSkills.map(s => `
              <div class="skill-item">
                <div class="skill-info">
                  <span class="skill-name">${s.name}</span>
                  <span class="skill-val" data-target="${s.level}">0%</span>
                </div>
                <div class="skill-bar-track">
                  <div class="skill-bar-fill js-skill-fill" data-level="${s.level}"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      skillsContainer.insertAdjacentHTML('beforeend', catHTML);
    });
  }

  // 7. Initialize Robot Simulator
  let simulatorInstance = null;
  if (typeof window.initRobotSimulator === 'function') {
    simulatorInstance = window.initRobotSimulator('sim-canvas');
  }
  

  // Initialize Contents Interactive Vector Field
  let contentsVectorInstance = null;
  if (document.getElementById('contents-vector-canvas')) {
    contentsVectorInstance = new ContentsVectorField('contents-vector-canvas');
  }

  // Initialize Research Swarm Simulator on Scene 2
  let researchSwarmInstance = null;
  if (document.getElementById('canvas-research-swarm')) {
    researchSwarmInstance = new ProceduralSwarmSimulator(
      'canvas-research-swarm',
      'nAgents', 'spd', 'coh',
      'nOut', 'sOut', 'cOut',
      'btn-swarm-reset', 'btn-swarm-waypoint'
    );
  }
  
  // Initialize Robotic Assembly Simulator on Scene 2
  let roboticAssemblyInstance = null;
  if (document.getElementById('canvas-assembly-sim')) {
    roboticAssemblyInstance = new RoboticAssemblySimulator(
      'canvas-assembly-sim',
      'assembly-log',
      'assembly-stability-fill',
      'assembly-stability-val',
      'assembly-progress-fill',
      'assembly-progress-val',
      'btn-assembly-play',
      'btn-assembly-step',
      'btn-assembly-fault',
      'btn-assembly-reset',
      'twin-sync-status'
    );
  }
  
  // Simulator UI control hooks
  const toggleSafety = document.getElementById('toggle-safety');
  if (toggleSafety) {
    toggleSafety.addEventListener('change', (e) => {
      if (simulatorInstance) simulatorInstance.toggleSafety(e.target.checked);
    });
  }
  
  const toggleIntent = document.getElementById('toggle-intent');
  if (toggleIntent) {
    toggleIntent.addEventListener('change', (e) => {
      if (simulatorInstance) simulatorInstance.toggleIntent(e.target.checked);
    });
  }
  
  const btnFollow = document.getElementById('btn-mode-follow');
  const btnCoop = document.getElementById('btn-mode-coop');
  
  if (btnFollow && btnCoop) {
    btnFollow.addEventListener('click', () => {
      btnFollow.classList.add('btn-active');
      btnCoop.classList.remove('btn-active');
      if (simulatorInstance) simulatorInstance.setMode('follow');
    });
    
    btnCoop.addEventListener('click', () => {
      btnCoop.classList.add('btn-active');
      btnFollow.classList.remove('btn-active');
      if (simulatorInstance) simulatorInstance.setMode('coop');
    });
  }
  
  const btnClearCoop = document.getElementById('btn-clear-coop');
  if (btnClearCoop) {
    btnClearCoop.addEventListener('click', () => {
      if (simulatorInstance) simulatorInstance.clearCoop();
    });
  }

  // 8. Gallery Carousel Function
  window.changeChapterImage = function(chapterId, imgPath, caption, thumbElement) {
    const mainImg = document.getElementById(`main-img-${chapterId}`);
    const mainVideo = document.getElementById(`main-video-${chapterId}`);
    const captionEl = document.getElementById(`caption-${chapterId}`);
    
    if (imgPath.endsWith('.mp4')) {
      if (mainImg) mainImg.style.display = 'none';
      if (mainVideo) {
        mainVideo.src = imgPath;
        mainVideo.style.display = 'block';
        mainVideo.play();
      }
    } else {
      if (mainVideo) {
        mainVideo.style.display = 'none';
        mainVideo.src = '';
      }
      if (mainImg) {
        mainImg.src = imgPath;
        mainImg.style.display = 'block';
      }
    }
    
    if (captionEl) captionEl.textContent = caption;
    
    // Update main container's click action
    const container = (mainImg || mainVideo)?.closest('.main-image-container');
    if (container) {
      container.setAttribute('onclick', `openLightbox('${imgPath}', '${caption.replace(/'/g, "\\'")}')`);
    }
    
    // Update thumbnail border selection state
    const thumbStrip = thumbElement.parentNode;
    thumbStrip.querySelectorAll('.thumbnail-item').forEach(item => item.classList.remove('active'));
    thumbElement.classList.add('active');
  };

  // 9. Lightbox Modals — with gallery prev/next navigation
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  // Gallery state for navigation
  let _galleryItems = [];   // array of {path, label}
  let _galleryIndex = 0;

  function _showLightboxItem(path, caption) {
    if (!lightbox) return;
    const lightboxVideo = document.getElementById('lightbox-video');
    const isVideo = path.endsWith('.mp4') || path.endsWith('.webm');

    if (isVideo) {
      if (lightboxImg) lightboxImg.style.display = 'none';
      if (lightboxVideo) {
        lightboxVideo.src = path;
        lightboxVideo.style.display = 'block';
        lightboxVideo.play().catch(() => {});
      }
    } else {
      if (lightboxVideo) { lightboxVideo.pause(); lightboxVideo.style.display = 'none'; lightboxVideo.src = ''; }
      if (lightboxImg) { lightboxImg.src = path; lightboxImg.style.display = 'block'; }
    }

    if (lightboxCaption) lightboxCaption.textContent = caption;

    // Update counter and nav button visibility
    if (_galleryItems.length > 1) {
      if (lightboxCounter) lightboxCounter.textContent = `${_galleryIndex + 1} / ${_galleryItems.length}`;
      if (lightboxPrev) lightboxPrev.style.display = 'flex';
      if (lightboxNext) lightboxNext.style.display = 'flex';
    } else {
      if (lightboxCounter) lightboxCounter.textContent = '';
      if (lightboxPrev) lightboxPrev.style.display = 'none';
      if (lightboxNext) lightboxNext.style.display = 'none';
    }

    lightbox.classList.add('active');
  }

  // galleryId (optional): the id of the drag-gallery container
  // index (optional): which item was clicked
  window.openLightbox = function(imgPath, caption, galleryId, index) {
    if (!lightbox) return;

    if (galleryId) {
      // Build gallery items from the gallery container's cards
      const galleryEl = document.getElementById(galleryId);
      if (galleryEl) {
        _galleryItems = Array.from(galleryEl.querySelectorAll('.gallery-card')).map(card => {
          const img = card.querySelector('img');
          const vid = card.querySelector('video');
          const capEl = card.querySelector('.gallery-card-caption');
          return {
            path: img ? img.src : (vid ? vid.src : ''),
            label: capEl ? capEl.textContent : ''
          };
        });
        _galleryIndex = typeof index === 'number' ? index : 0;
      } else {
        _galleryItems = [{ path: imgPath, label: caption }];
        _galleryIndex = 0;
      }
    } else {
      _galleryItems = [{ path: imgPath, label: caption }];
      _galleryIndex = 0;
    }

    const item = _galleryItems[_galleryIndex];
    _showLightboxItem(item.path, item.label);
  };

  window.navigateLightbox = function(direction) {
    if (_galleryItems.length <= 1) return;
    _galleryIndex = (_galleryIndex + direction + _galleryItems.length) % _galleryItems.length;
    const item = _galleryItems[_galleryIndex];
    _showLightboxItem(item.path, item.label);
  };

  window.closeLightbox = function() {
    if (lightbox) {
      lightbox.classList.remove('active');
      const lightboxVideo = document.getElementById('lightbox-video');
      if (lightboxVideo) { lightboxVideo.pause(); lightboxVideo.src = ''; }
      _galleryItems = [];
      _galleryIndex = 0;
    }
  };

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') window.closeLightbox();
    if (e.key === 'ArrowRight') window.navigateLightbox(1);
    if (e.key === 'ArrowLeft') window.navigateLightbox(-1);
  });


  // 10. Skills progress bars animation observer
  const skillsFillElements = document.querySelectorAll('.js-skill-fill');
  const skillsValElements = document.querySelectorAll('.skill-val');
  
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger fills
        skillsFillElements.forEach(fill => {
          const level = fill.getAttribute('data-level');
          fill.style.width = `${level}%`;
        });
        
        // Count up numbers
        skillsValElements.forEach(val => {
          const target = parseInt(val.getAttribute('data-target'), 10);
          let current = 0;
          const interval = setInterval(() => {
            if (current >= target) {
              val.textContent = `${target}%`;
              clearInterval(interval);
            } else {
              current += Math.ceil(target / 15);
              if (current > target) current = target;
              val.textContent = `${current}%`;
            }
          }, 35);
        });
        
        skillsObserver.disconnect(); // Only animate once
      }
    });
  }, { threshold: 0.15 });
  
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }

  // 11. Scrollytelling Star Field Canvas
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.getElementById('stars');
  let stars = [];
  let cx = null;
  
  if (cv) {
    cx = cv.getContext('2d');
    
    function sizeStars() {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      stars = Array.from({ length: 170 }, () => ({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.7 + 0.2
      }));
      drawStars(1);
    }
    
    window.drawStars = function(op) {
      if (!cx) return;
      cx.clearRect(0, 0, cv.width, cv.height);
      cx.fillStyle = '#BFE9F2'; // Ice blue/teal color matching design tokens
      for (const s of stars) {
        cx.globalAlpha = s.a * op;
        cx.beginPath();
        cx.arc(s.x, s.y, s.r, 0, 7);
        cx.fill();
      }
      cx.globalAlpha = 1;
    };
    
    sizeStars();
    window.addEventListener('resize', sizeStars);
  }

  // 12. LogiRhein Live Color-Interpolating Background Wash
  const wash = document.getElementById('bgwash');
  let washStops = [];
  
  const hex2rgb = h => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16)
  ];
  
  function buildWash() {
    const vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const fitEl = document.getElementById('research-fit');
    const chapEl = document.getElementById('chapters');
    const skillsEl = document.getElementById('skills');
    const cvEl = document.getElementById('cv');
    
    // Force pure white background washstops to lock in clean academic paper style
    const rawStops = [
      [0, '#FFFFFF'],
      [max, '#FFFFFF']
    ];
    
    washStops = rawStops.map(([y, col]) => [y, hex2rgb(col)]);
  }
  
  const clamp = (v, minVal, maxVal) => Math.min(maxVal, Math.max(minVal, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  
  function applyWash() {
    if (!wash || washStops.length === 0) return;
    const y = window.scrollY + window.innerHeight * 0.55;
    
    let a = washStops[0];
    let b = washStops[washStops.length - 1];
    
    for (let i = 0; i < washStops.length - 1; i++) {
      if (y >= washStops[i][0] && y <= washStops[i + 1][0]) {
        a = washStops[i];
        b = washStops[i + 1];
        break;
      }
    }
    if (y > washStops[washStops.length - 1][0]) {
      a = b = washStops[washStops.length - 1];
    }
    
    const t = a[0] === b[0] ? 0 : clamp((y - a[0]) / (b[0] - a[0]), 0, 1);
    const rgb = a[1].map((v, i) => Math.round(lerp(v, b[1][i], t)));
    
    wash.style.background = `rgb(${rgb.join(',')})`;
    
    // Toggle body 'on-light' class to swap text theme variables when background is bright
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    document.body.classList.toggle('on-light', lum > 0.5);
  }

  // 13. River Navigation Track Highlight
  const navFill = document.getElementById('navFill');
  const stops = [...document.querySelectorAll('#riverNav .stop')];
  
  function stopY(s) {
    const el = document.getElementById(s.dataset.target);
    if (!el) return 0;
    return el.offsetTop + parseFloat(s.dataset.frac) * (el.offsetHeight - window.innerHeight);
  }
  
  function layoutStops() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    stops.forEach(s => {
      s.style.top = (stopY(s) / max * 100) + '%';
    });
    buildWash();
    applyWash();
  }

  stops.forEach(s => {
    s.addEventListener('click', () => {
      const targetY = stopY(s);
      window.scrollTo({
        top: targetY + 2,
        behavior: prefersReduce ? 'auto' : 'smooth'
      });
    });
  });

  // 14. Typewriter Proposal Brief (Rhine terminal style)
  const briefHTML = [
    ['p', '> INITIALIZING CO-DESIGN INTERACTION BRIEF...\n'],
    ['', 'Candidate: '], ['a', 'Nina Velimirovic'], ['', '\n'],
    ['', 'Role:      '], ['a', 'Computational Design Researcher & Architect'], ['', '\n'],
    ['', 'Focus:     '], ['a', 'Human-Machine Collaboration & Robotic Systems'], ['', '\n\n'],
    ['p', '> CORE RESEARCH & SYSTEMS THEMES:\n'],
    ['', '1. '], ['a', 'Intent Interfaces: '], ['', 'Dynamic path projection mapping & safety field zones.\n'],
    ['', '2. '], ['a', 'Kinematics:         '], ['', 'Adaptive CCD solver configurations on unstructured wood/concrete sites.\n'],
    ['', '3. '], ['a', 'Empirical Auditing: '], ['', 'Quantifying trust using portable EEG arrays during co-op assembly.\n\n'],
    ['p', '> DATA STREAM ACTIVE. SCROLL DOWN TO INSPECT PROJECTS...']
  ];
  
  const termBody = document.getElementById('termBody');
  let typed = false;
  
  if (termBody) {
    const typewriterObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || typed) return;
      typed = true;
      
      if (prefersReduce) {
        termBody.innerHTML = briefHTML.map(([c, t]) => c ? `<span class="${c}">${t}</span>` : t).join('');
        return;
      }
      
      let seg = 0, ch = 0;
      const cur = document.createElement('span');
      cur.className = 'cursor';
      termBody.appendChild(cur);
      let span = null;
      
      function tick() {
        if (seg >= briefHTML.length) {
          cur.remove();
          return;
        }
        const [c, t] = briefHTML[seg];
        if (ch === 0) {
          span = document.createElement('span');
          if (c) span.className = c;
          termBody.insertBefore(span, cur);
        }
        span.textContent += t[ch++];
        if (ch >= t.length) {
          seg++;
          ch = 0;
        }
        setTimeout(tick, t[ch - 1] === '\n' ? 140 : 18);
      }
      tick();
    }, { threshold: 0.3 });
    
    typewriterObserver.observe(termBody);
  }

  // 15. Master scroll controller
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const curScroll = window.scrollY;
      
      // Update vertical progress track
      if (navFill) {
        navFill.style.height = (clamp(curScroll / max, 0, 1) * 100) + '%';
      }
      
      // Update passed state on stops
      stops.forEach(s => {
        s.classList.toggle('passed', curScroll >= stopY(s) - 8);
      });
      
      // Interpolate background wash color
      applyWash();
      
      // Fade out star canvas as page transitions to light mode
      const cvEl = document.getElementById('cv');
      if (cvEl && window.drawStars) {
        const fadeStart = cvEl.offsetTop - window.innerHeight;
        const op = clamp(1 - (curScroll - fadeStart) / (window.innerHeight * 0.8), 0, 1);
        window.drawStars(op);
      }
      
      ticking = false;
    });
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initialize layout stops and bind observers
  setTimeout(() => {
    layoutStops();
    onScroll();
  }, 100);
  window.addEventListener('resize', layoutStops);

  // 16. Keyboard Arrow Snapping
  function snapTargets() {
    const targets = [];
    const mainIds = ['home', 'contents-scene', 'profile-scene', 'research-fit', 'chapters', 'skills', 'cv', 'contact'];
    mainIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) targets.push(el.offsetTop);
    });
    
    // Add individual chapter stops for sub-snapping
    const chaptersList = document.querySelectorAll('article.chapter-block');
    chaptersList.forEach(ch => {
      targets.push(ch.offsetTop);
    });
    
    targets.sort((a, b) => a - b);
    return targets.filter((val, idx, arr) => idx === 0 || val - arr[idx - 1] > 50);
  }
  
  window.addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', ' ', 'PageDown', 'PageUp'].includes(e.key)) return;
    
    // Bypass if user is interacting with form controls or inputs
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    
    e.preventDefault();
    const fwd = ['ArrowDown', 'ArrowRight', ' ', 'PageDown'].includes(e.key);
    const ts = snapTargets();
    const cur = window.scrollY;
    
    let next = fwd ? ts.find(t => t > cur + 15) : [...ts].reverse().find(t => t < cur - 15);
    if (next === undefined) {
      next = fwd ? document.documentElement.scrollHeight : 0;
    }
    
    window.scrollTo({
      top: next,
      behavior: prefersReduce ? 'auto' : 'smooth'
    });
  });

  // 17. Generative Diagram drawing loop for sub-canvases
  function drawGenerativeDiagrams() {
    // 1. Draw Contents vector canvas (Handled dynamically by ContentsVectorField)

    // 2. Draw Research Statement canvas (Handled dynamically by ProceduralSwarmSimulator)

    // 3. Draw sub diagrams for chapters (deleted)
  }

  // 18. Profile Photo Drag and Drop Uploader
  const photoDrop = document.getElementById('photo-drop');
  const photoInput = document.getElementById('profile-photo-input');
  const uploadedImg = document.getElementById('profile-uploaded-img');
  const dropText = photoDrop ? photoDrop.querySelector('.drop-text') : null;
  
  if (photoDrop && photoInput && uploadedImg) {
    photoDrop.addEventListener('click', () => photoInput.click());
    
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleProfilePhoto(file);
    });
    
    photoDrop.addEventListener('dragover', (e) => {
      e.preventDefault();
      photoDrop.classList.add('dragover');
    });
    
    photoDrop.addEventListener('dragleave', () => {
      photoDrop.classList.remove('dragover');
    });
    
    photoDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      photoDrop.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleProfilePhoto(file);
    });
  }
  
  function handleProfilePhoto(file) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImg.src = e.target.result;
      uploadedImg.style.display = 'block';
      if (dropText) dropText.style.display = 'none';
      photoDrop.style.borderStyle = 'solid';
    };
    reader.readAsDataURL(file);
  }

  // Call generative diagram drawings
  setTimeout(() => {
    drawGenerativeDiagrams();
  }, 150);

  // Resize canvas redraw
  window.addEventListener('resize', () => {
    layoutStops();
    drawGenerativeDiagrams();
  });

  // 19. Trigger PDF Export
  window.triggerPdfExport = function() {
    const path = window.location.pathname;
    let targetUrl = 'Files/portfolio-book.html?print=true';
    if (path.includes('/Files/') || path.endsWith('/Files')) {
      targetUrl = 'portfolio-book.html?print=true';
    }
    window.open(targetUrl, '_blank');
  };
});
