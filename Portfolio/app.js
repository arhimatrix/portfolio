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

    // Background color is pure white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid ticks (subtle)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    const tickSpacing = 20;
    for (let x = tickSpacing; x < this.width; x += tickSpacing) {
      for (let y = tickSpacing; y < this.height; y += tickSpacing) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }

    // Draw target crosshairs/rings
    for (const t of this.targets) {
      const pulse = Math.sin(this.frame * 0.05) * 3;
      ctx.strokeStyle = '#ef9f27'; // Amber
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 10 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ef9f27';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#ef9f27';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(t.x - 8, t.y); ctx.lineTo(t.x + 8, t.y);
      ctx.moveTo(t.x, t.y - 8); ctx.lineTo(t.x, t.y + 8);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Draw proximity lines between agents
    ctx.lineWidth = 0.5;
    const threshold = 55;
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a1 = this.agents[i];
        const a2 = this.agents[j];
        const d = Math.hypot(a1.x - a2.x, a1.y - a2.y);
        if (d < threshold) {
          const alpha = (1 - d / threshold) * 0.22;
          ctx.strokeStyle = `rgba(0, 155, 158, ${alpha})`; // Teal connections
          ctx.beginPath();
          ctx.moveTo(a1.x, a1.y);
          ctx.lineTo(a2.x, a2.y);
          ctx.stroke();
        }
      }
    }

    // Draw trails and agents
    for (const a of this.agents) {
      // Trail
      if (a.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(a.trail[0].x, a.trail[0].y);
        for (let i = 1; i < a.trail.length; i++) {
          ctx.lineTo(a.trail[i].x, a.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(0, 155, 158, 0.12)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Agent dot
      const pulse = (Math.sin(a.phase) * 0.25 + 0.75);
      ctx.fillStyle = '#009b9e'; // Teal
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 2.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Draw status label text inside canvas bottom-left
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.font = '8px IBM Plex Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`AGENTS: ${this.agents.length}   WAYPOINTS: ${this.targets.length}   FRAME: ${this.frame}`, 10, this.height - 10);
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
    
    this.resize();
    this.initStructure();
    this.initRobots();
    this.bindEvents();
    
    this.log("System initialized. 3 robotic agents online.", "info");
    this.log("Consensus bidding protocol active.", "info");
    
    this.animate();
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
    
    if (this.faultInjected) {
      this.log("⚡ WARNING: Robot-1 offline! Sensor error.", "warn");
      this.log("⚡ [CONSENSUS] Recalculating task queues...", "warn");
      
      this.faultBtn.textContent = "⚡ CLEAR FAULT";
      this.faultBtn.classList.add('btn-active');
      
      if (this.syncEl) {
        this.syncEl.textContent = "● REDUCED SYNC (ROBOT 1 OFFLINE)";
        this.syncEl.classList.add('offline');
      }
      
      // If robot 1 was carrying, drop task
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
      
      this.faultBtn.textContent = "⚡ INJECT FAULT";
      this.faultBtn.classList.remove('btn-active');
      
      if (this.syncEl) {
        this.syncEl.textContent = "● TWIN SYNCED";
        this.syncEl.classList.remove('offline');
      }
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
    
    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Grid Ticks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    const spacing = 20;
    for (let x = spacing; x < this.width; x += spacing) {
      for (let y = spacing; y < this.height; y += spacing) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }
    
    // Concrete Foundation Piers (Centered perfectly under base blocks M01 and M12)
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 0.8;
    
    // Left Concrete Pier
    ctx.fillRect(57, this.height - 20, 11, 20);
    ctx.strokeRect(57, this.height - 20, 11, 20);
    
    // Right Concrete Pier
    ctx.fillRect(this.width - 68, this.height - 20, 11, 20);
    ctx.strokeRect(this.width - 68, this.height - 20, 11, 20);
    
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
        
        ctx.fillStyle = '#009b9e'; // Teal block
        ctx.fillRect(-5, -2.5, 10, 5);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-5, -2.5, 10, 5);
        
        // Structural node connection markers (central pins)
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
  
  // Define image mapping per chapter based on the prefixes of the files inside Portfolio/Neom/
  const chapterImages = {
    chapter1: [
      { file: "NEOM/portfolio_assets/Neom HSR1.jpg", label: "Multimodal Station Platform & High-Speed Rail Masterplan" },
      { file: "NEOM/portfolio_assets/grok-video-bf646256-0d23-418d-9bd8-08a0e451df7d.mp4", label: "NEOM High-Speed Rail Autonomous Circulation Simulation" },
      { file: "NEOM/portfolio_assets/Neom HSR2.png", label: "Passenger Concourse & Transit Hub Interior Rendering" },
      { file: "NEOM/portfolio_assets/Neom HSR3.jpg", label: "Parametric Station Canopy Structure Detail" },
      { file: "NEOM/portfolio_assets/grok-video-550a7b30-e323-4b45-b40b-ee5ca1c99402.mp4", label: "Zero-Carbon Transport Corridor Occupant Flow Analysis" },
      { file: "NEOM/portfolio_assets/Neom HSR4.jpg", label: "Autonomous Vehicle Interface & Platform Gates" },
      { file: "NEOM/portfolio_assets/Neom HSR5.png", label: "Integrated Urban Spine Mobility Hub Section Plan" },
      { file: "NEOM/portfolio_assets/grok-video-043ac60f-9cac-4672-9b7c-0c11c5b5833a.mp4", label: "Multi-Level Driverless Node Pedestrian Wayfinding Simulation" },
      { file: "NEOM/portfolio_assets/Neom HSR6.png", label: "High-Speed Rail Corridor Integration & Tunnel Section" },
      { file: "NEOM/portfolio_assets/Neom HSR7.png", label: "Zero-Carbon Urban District Masterplan Rendering" },
      { file: "NEOM/portfolio_assets/grok-video-47b058fd-4d08-4561-a3c0-796c5481acb0.mp4", label: "TOD District Pedestrian Circulation & Network Routing" },
      { file: "NEOM/portfolio_assets/Neom HSR8.jpg", label: "Underground Logistics & Freight Routing Network" },
      { file: "NEOM/portfolio_assets/grok-video-47b058fd-4d08-4561-a3c0-796c5481acb0 (2).mp4", label: "Dynamic Agent-Based Crowd Simulation - Multi-Hub Connection" },
      { file: "NEOM/portfolio_assets/Neom HSR9.jpg", label: "Urban Spine Transit Hub Structural Axonometric" },
      { file: "NEOM/portfolio_assets/grok-video-47b058fd-4d08-4561-a3c0-796c5481acb0 (4).mp4", label: "Transit Node Pedestrian Access Optimization Study" },
      { file: "NEOM/portfolio_assets/Neom HSR10.png", label: "NEOM Mobility Hub Digital Twin Network Graph" },
      { file: "NEOM/portfolio_assets/grok-video-47b058fd-4d08-4561-a3c0-796c5481acb0 (5).mp4", label: "Stochastic Queueing Analysis for Driverless Hub Boarding" },
      { file: "NEOM/portfolio_assets/grok-video-47b058fd-4d08-4561-a3c0-796c5481acb0 (6).mp4", label: "High-Density Station Platform Circulation Run" },
      { file: "NEOM/portfolio_assets/grok-video-4fe6a0ef-73a2-43ae-82b8-80d4c19dab35.mp4", label: "Generative Design Process for Urban Circulation Spine" },
      { file: "NEOM/portfolio_assets/grok-video-4fe6a0ef-73a2-43ae-82b8-80d4c19dab35 (1).mp4", label: "Autonomous Drone Corridor Traffic Simulation" },
      { file: "NEOM/portfolio_assets/grok-video-920b2d11-f65b-4a8b-8266-c280b32967fd (2).mp4", label: "Real-Time Infrastructure Routing and Flow Optimization" }
    ],
    chapter2: [],
    chapter3: [],
    chapter4: [],
    chapter5: [],
    chapter6: [],
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
      const firstImgPath = imgArray.length > 0 ? getImgPath(imgArray[0].file) : '';
      const mainLabel = imgArray.length > 0 ? imgArray[0].label : '';
      const isVideo = firstImgPath.endsWith('.mp4');
      
      const chapterHTML = `
        <article class="chapter-block scene light" id="${ch.id}">
          <div class="academic-header">
            <span class="left">03 · PROJECT</span>
            <span class="right">${ch.subtitle.toUpperCase()}</span>
          </div>
          
          <div class="chapter-layout-grid ${firstImgPath ? '' : 'no-media'}">
            ${firstImgPath ? `
              <div class="chapter-image-col">
                <div class="main-image-container" onclick="openLightbox('${firstImgPath}', '${mainLabel.replace(/'/g, "\\'")}')" data-chapter="${ch.id}" style="position:relative; width:100%; aspect-ratio:16/10; overflow:hidden; border:1px solid var(--d-border); border-radius:4px; background:#fafbfb;">
                  <img src="${isVideo ? '' : firstImgPath}" alt="${mainLabel}" class="js-chapter-main-img" id="main-img-${ch.id}" style="${isVideo ? 'display:none;' : 'display:block;'} width:100%; height:100%; object-fit:cover;">
                  <video src="${isVideo ? firstImgPath : ''}" id="main-video-${ch.id}" class="js-chapter-main-video" style="${isVideo ? 'display:block;' : 'display:none;'} width:100%; height:100%; object-fit:cover;" autoplay loop muted playsinline></video>
                  <div class="main-image-overlay js-chapter-main-caption" id="caption-${ch.id}">${mainLabel}</div>
                </div>
                
                <div class="thumbnail-strip" style="margin-top: 10px;">
                  ${imgArray.map((img, idx) => {
                    const path = getImgPath(img.file);
                    const isThumbVid = path.endsWith('.mp4');
                    return `
                      <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" 
                           onclick="changeChapterImage('${ch.id}', '${path}', '${img.label.replace(/'/g, "\\'")}', this)">
                        ${isThumbVid ? `
                          <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#000;">
                            <video src="${path}" style="width:100%; height:100%; object-fit:cover; opacity:0.65;" preload="metadata" muted></video>
                            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; text-shadow:0 1px 3px rgba(0,0,0,0.8);">▶</div>
                          </div>
                        ` : `
                          <img src="${path}" alt="${img.label}">
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <div class="chapter-text-col">
              <span class="chapter-num-badge">Chapter 0${ch.num}</span>
              <h2 class="profile-headline">${ch.title}</h2>
              <p class="chapter-focus-bar">
                ${ch.theme}
              </p>
              <p class="profile-para">${ch.summary}</p>
              
              <ul class="chapter-bullets" style="margin-bottom: 25px;">
                ${ch.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
              
              <div class="chapter-tags" style="margin-bottom: 20px;">
                ${ch.tags.map(t => `<span class="tag">${t}</span>`).join('')}
              </div>
              
              ${ch.id === 'chapter4' ? `
                <div style="margin-top: 15px; margin-bottom: 15px;">
                  <a href="titan-swarm.html" class="btn-academic" target="_blank" style="display: inline-block; font-weight: bold; border: 1.5px solid var(--d-teal); color: var(--d-teal); text-decoration: none;">
                    LAUNCH DUAL-MODE SWARM SIMULATOR & CAD INSPECTOR ↗
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="academic-footer">
            <span class="left">NINA VELIMIROVIC · PORTFOLIO</span>
            <span class="right">0${ch.num + 4} / 15</span>
          </div>
        </article>
      `;
      chaptersContainer.insertAdjacentHTML('beforeend', chapterHTML);
    });
  }

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

  // 9. Lightbox Modals
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  
  window.openLightbox = function(imgPath, caption) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    const lightboxVideo = document.getElementById('lightbox-video');
    
    if (imgPath.endsWith('.mp4')) {
      if (lightboxImg) lightboxImg.style.display = 'none';
      if (lightboxVideo) {
        lightboxVideo.src = imgPath;
        lightboxVideo.style.display = 'block';
        lightboxVideo.play();
      }
    } else {
      if (lightboxVideo) {
        lightboxVideo.style.display = 'none';
        lightboxVideo.src = '';
      }
      if (lightboxImg) {
        lightboxImg.src = imgPath;
        lightboxImg.style.display = 'block';
      }
    }
    
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
  };
  
  window.closeLightbox = function() {
    if (lightbox) {
      lightbox.classList.remove('active');
      const lightboxVideo = document.getElementById('lightbox-video');
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = '';
      }
    }
  };

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
    window.print();
  };

  // ── 20. SCROLL REVEAL: Fade-in chapters as they enter viewport ──
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.chapter-block').forEach(el => {
    revealObserver.observe(el);
  });

  // Also reveal on load for already-visible elements
  setTimeout(() => {
    document.querySelectorAll('.chapter-block').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  }, 100);

  // ── 21. SKILL BARS: Animate fill when in viewport ──
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          const pct = bar.getAttribute('data-pct') || bar.style.width;
          bar.style.setProperty('--skill-pct', pct);
          setTimeout(() => bar.classList.add('animated'), 100);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skills-category-card').forEach(el => {
    el.querySelectorAll('.skill-bar-fill').forEach(bar => {
      const orig = bar.style.width;
      bar.setAttribute('data-pct', orig);
      bar.style.setProperty('--skill-pct', orig);
      bar.classList.add('skill-bar-fill');
    });
    skillObserver.observe(el);
  });

  // ── 22. IMAGE HOVER REVEAL captions ──
  document.querySelectorAll('.main-image-container').forEach(container => {
    const overlay = container.querySelector('.main-image-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    container.addEventListener('mouseenter', () => overlay.style.opacity = '1');
    container.addEventListener('mouseleave', () => overlay.style.opacity = '0');
  });

  // ── 23. THUMBNAIL active state on click ──
  document.querySelectorAll('.thumbnail-strip').forEach(strip => {
    strip.querySelectorAll('.thumbnail-item').forEach(thumb => {
      thumb.addEventListener('click', () => {
        strip.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  });

  // ── 24. HERO: Make canvas truly full-bleed ──
  const heroCanvasContainer = document.getElementById('robot-canvas-container');
  if (heroCanvasContainer) {
    heroCanvasContainer.style.position = 'absolute';
    heroCanvasContainer.style.inset = '0';
    heroCanvasContainer.style.width = '100%';
    heroCanvasContainer.style.height = '100%';
    heroCanvasContainer.style.border = 'none';
    heroCanvasContainer.style.borderRadius = '0';
    heroCanvasContainer.style.margin = '0';
  }

  // ── 25. SMOOTH image transitions on thumbnail click ──
  const origChangeImg = window.changeChapterImage;
  if (origChangeImg) {
    window.changeChapterImage = function(chapterId, imgPath, caption, thumbElement) {
      const mainImg = document.getElementById(`main-img-${chapterId}`);
      if (mainImg) {
        mainImg.style.opacity = '0';
        mainImg.style.transition = 'opacity 0.25s ease';
        setTimeout(() => {
          origChangeImg(chapterId, imgPath, caption, thumbElement);
          mainImg.style.opacity = '1';
        }, 250);
      } else {
        origChangeImg(chapterId, imgPath, caption, thumbElement);
      }
    };
  }
});
